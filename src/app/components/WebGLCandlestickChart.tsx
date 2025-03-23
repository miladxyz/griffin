// Modified component with resizing fix
"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import ChartHeader from "./ChartHeader";
import OrderManagement from "./OrderManagement";

type TimeFrame = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d" | "1w" | "1M";

type CandlestickData = { x: number; y: [number, number, number, number] }; // [open, high, low, close]

type Order = {
  id: string; // Unique identifier for each order
  type: "buy" | "sell";
  quantity: number;
  price: number;
  stopLoss: number | null;
  takeProfit: number | null;
};

const WebGLCandlestickChart = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("5m");
  const [data, setData] = useState<CandlestickData[]>([]);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [balance, setBalance] = useState<number>(1000);
  const [quantity, setQuantity] = useState<number>(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profitLoss, setProfitLoss] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  // const [stopLossPrice, setStopLossPrice] = useState<string>("");
  // const [takeProfitPrice, setTakeProfitPrice] = useState<string>("");
  const [orderSectionHeight, setOrderSectionHeight] = useState(
    window.innerHeight * 0.4
  );
  const [isResizing, setIsResizing] = useState(false);
  const [startY, setStartY] = useState(0);
  const resizeHandleRef = useRef(null);
  const isInitializedRef = useRef(false);

  // One-time WebGL initialization
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    glRef.current = gl;

    // Vertex shader source code
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0, 1);
      }
    `;

    // Fragment shader source code
    const fragmentShaderSource = `
      precision mediump float;
      uniform vec4 u_color;
      void main() {
        gl_FragColor = u_color;
      }
    `;

    // Compile shaders
    const vertexShader = compileShader(
      gl,
      gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    if (!vertexShader || !fragmentShader) {
      console.error("Shader compilation failed");
      return;
    }

    // Create shader program
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
      console.error("Program creation failed");
      return;
    }

    programRef.current = program;
    gl.useProgram(program);
    isInitializedRef.current = true;

    // Cleanup on unmount only
    return () => {
      if (gl && program) {
        gl.deleteProgram(program);
      }
      if (gl && vertexShader) {
        gl.deleteShader(vertexShader);
      }
      if (gl && fragmentShader) {
        gl.deleteShader(fragmentShader);
      }
    };
  }, []); // Empty dependency array - run once on mount

  // Add this effect for resize handling with debouncing
  useEffect(() => {
    const handleMouseDown = (e) => {
      setIsResizing(true);
      setStartY(e.clientY);
    };

    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const delta = startY - e.clientY;
      const newHeight = Math.max(
        100,
        Math.min(window.innerHeight * 0.8, orderSectionHeight + delta)
      );
      setOrderSectionHeight(newHeight);
      setStartY(e.clientY);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    const handle = resizeHandleRef.current;
    if (handle) {
      handle.addEventListener("mousedown", handleMouseDown);
    }

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      if (handle) {
        handle.removeEventListener("mousedown", handleMouseDown);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, orderSectionHeight, startY]);

  // Update canvas dimensions without reinitializing WebGL
  useEffect(() => {
    // Only adjust dimensions, don't recreate context
    const chartHeight = window.innerHeight - orderSectionHeight - 60; // 60px for header
    const gl = glRef.current;

    if (canvasRef.current) {
      canvasRef.current.height = chartHeight;
    }

    if (overlayRef.current) {
      overlayRef.current.height = chartHeight;
    }

    if (gl && canvasRef.current) {
      gl.viewport(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    // Redraw the chart (without reinitializing WebGL)
    if (data.length > 0 && gl && programRef.current) {
      drawChart();
    }
  }, [orderSectionHeight]);

  const generateOrderId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  // Function to set stop loss for an order
  // const setOrderStopLoss = (orderId: string) => {
  //   if (!stopLossPrice) return;

  //   const stopLossValue = parseFloat(stopLossPrice);
  //   if (isNaN(stopLossValue)) return;

  //   setOrders((prevOrders) =>
  //     prevOrders.map((order) =>
  //       order.id === orderId ? { ...order, stopLoss: stopLossValue } : order
  //     )
  //   );

  //   setStopLossPrice("");
  //   setSelectedOrderId(null);
  // };

  // Function to set take profit for an order
  // const setOrderTakeProfit = (orderId: string) => {
  //   if (!takeProfitPrice) return;

  //   const takeProfitValue = parseFloat(takeProfitPrice);
  //   if (isNaN(takeProfitValue)) return;

  //   setOrders((prevOrders) =>
  //     prevOrders.map((order) =>
  //       order.id === orderId ? { ...order, takeProfit: takeProfitValue } : order
  //     )
  //   );

  //   setTakeProfitPrice("");
  //   setSelectedOrderId(null);
  // };
  // Function to close an order
  const closeOrder = (orderId: string) => {
    if (latestPrice === null) return;

    const orderToClose = orders.find((order) => order.id === orderId);
    if (!orderToClose) return;

    let profit = 0;

    if (orderToClose.type === "buy") {
      profit = (latestPrice - orderToClose.price) * orderToClose.quantity;
    } else if (orderToClose.type === "sell") {
      profit = (orderToClose.price - latestPrice) * orderToClose.quantity;
    }

    // Update balance
    setBalance(
      (prevBalance) =>
        prevBalance + orderToClose.price * orderToClose.quantity + profit
    );

    // Remove the order
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== orderId)
    );
  };

  // Check for stop loss and take profit triggers
  useEffect(() => {
    if (latestPrice === null || orders.length === 0) return;

    orders.forEach((order) => {
      // Check stop loss condition
      if (order.stopLoss !== null) {
        if (
          (order.type === "buy" && latestPrice <= order.stopLoss) ||
          (order.type === "sell" && latestPrice >= order.stopLoss)
        ) {
          closeOrder(order.id);
          // You might want to add a notification here
          console.log(`Stop loss triggered for order ${order.id}`);
        }
      }

      // Check take profit condition
      if (order.takeProfit !== null) {
        if (
          (order.type === "buy" && latestPrice >= order.takeProfit) ||
          (order.type === "sell" && latestPrice <= order.takeProfit)
        ) {
          closeOrder(order.id);
          // You might want to add a notification here
          console.log(`Take profit triggered for order ${order.id}`);
        }
      }
    });
  }, [latestPrice, orders]);

  // Fetch historical data for the selected time frame
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await axios.get(
          `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${timeFrame}&limit=100`
        );
        const historicalData: CandlestickData[] = response.data.map(
          (kline: any[]) => ({
            x: kline[0], // Timestamp
            y: [
              parseFloat(kline[1]), // Open
              parseFloat(kline[2]), // High
              parseFloat(kline[3]), // Low
              parseFloat(kline[4]), // Close
            ],
          })
        );

        setData(historicalData);
        setLatestPrice(historicalData[historicalData.length - 1].y[3]); // Set latest price
      } catch (error) {
        console.error("Error fetching historical data:", error);
      }
    };

    fetchHistoricalData();
  }, [timeFrame]);

  // Connect to WebSocket for real-time candlestick updates
  useEffect(() => {
    wsRef.current = new WebSocket(
      `wss://stream.binance.com:9443/ws/btcusdt@kline_${timeFrame}`
    );

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const kline = message.k;

      const newCandle: CandlestickData = {
        x: kline.t, // Timestamp
        y: [
          parseFloat(kline.o), // Open
          parseFloat(kline.h), // High
          parseFloat(kline.l), // Low
          parseFloat(kline.c), // Close
        ],
      };

      setData((prevData) => {
        const lastCandle = prevData[prevData.length - 1];

        // If the new candle has the same timestamp as the last candle, update it
        if (lastCandle && lastCandle.x === newCandle.x) {
          return [...prevData.slice(0, -1), newCandle];
        } else {
          return [...prevData, newCandle];
        }
      });

      setLatestPrice(parseFloat(kline.c)); // Update latest price
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [timeFrame]);

  // Calculate profit/loss based on live price
  useEffect(() => {
    if (latestPrice === null || orders.length === 0) return;

    let totalProfitLoss = 0;
    orders.forEach((order) => {
      if (order.type === "buy") {
        totalProfitLoss += (latestPrice - order.price) * order.quantity;
      } else if (order.type === "sell") {
        totalProfitLoss += (order.price - latestPrice) * order.quantity;
      }
    });

    setProfitLoss(totalProfitLoss);
  }, [latestPrice, orders]);

  // Draw chart - extracted to a separate function to avoid recreating on resize
  const drawChart = () => {
    const gl = glRef.current;
    const overlayCanvas = overlayRef.current;
    if (!gl || !overlayCanvas || data.length === 0 || !programRef.current) return;

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(programRef.current);

    // Map data to WebGL coordinates
    const prices = data.flatMap((candle) => [candle.y[1], candle.y[2]]); // High and Low
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const gap = 0.01; // Gap between candles
    const candleWidth = 2 / data.length - gap; // Width of each candle

    // Draw candlesticks
    data.forEach((candle, index) => {
      const x = (index / data.length) * 2 - 1 + gap / 2; // Map to [-1, 1] with gap
      const open = ((candle.y[0] - minPrice) / (maxPrice - minPrice)) * 2 - 1;
      const close = ((candle.y[3] - minPrice) / (maxPrice - minPrice)) * 2 - 1;
      const high = ((candle.y[1] - minPrice) / (maxPrice - minPrice)) * 2 - 1;
      const low = ((candle.y[2] - minPrice) / (maxPrice - minPrice)) * 2 - 1;

      // Determine candle color (TradingView style)
      const isBullish = candle.y[0] < candle.y[3]; // Close > Open
      const bodyColor = isBullish
        ? [38 / 255, 166 / 255, 154 / 255, 1] // #26a69a
        : [239 / 255, 83 / 255, 80 / 255, 1]; // #ef5350
      const wickColor = bodyColor; // Wick color matches body color

      // Draw the wick (high to low)
      drawLine(gl, x, high, x, low, wickColor);

      // Draw the body (open to close)
      drawRectangle(
        gl,
        x - candleWidth / 2,
        open,
        x + candleWidth / 2,
        close,
        bodyColor
      );
    });

    // Draw overlay elements
    const overlayCtx = overlayCanvas.getContext("2d");
    if (!overlayCtx) return;

    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Draw price levels
    const priceRange = maxPrice - minPrice;
    const priceStep = priceRange / 5; // Divide the price range into 5 levels
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + priceStep * i;
      const y = ((price - minPrice) / priceRange) * overlayCanvas.height;

      overlayCtx.strokeStyle = "#444"; // Gray line for price levels
      overlayCtx.beginPath();
      overlayCtx.moveTo(0, overlayCanvas.height - y);
      overlayCtx.lineTo(overlayCanvas.width, overlayCanvas.height - y);
      overlayCtx.stroke();

      overlayCtx.fillStyle = "#fff"; // White text for price labels
      overlayCtx.font = "12px Arial";
      overlayCtx.fillText(price.toFixed(2), 5, overlayCanvas.height - y - 5);
    }

    // Draw the current price line and label
    if (latestPrice !== null) {
      const y = ((latestPrice - minPrice) / priceRange) * overlayCanvas.height;

      overlayCtx.strokeStyle = "#26a69a"; // Green line for the current price
      overlayCtx.beginPath();
      overlayCtx.moveTo(0, overlayCanvas.height - y);
      overlayCtx.lineTo(overlayCanvas.width, overlayCanvas.height - y);
      overlayCtx.stroke();

      overlayCtx.fillStyle = "#26a69a"; // Green text for the current price label
      overlayCtx.font = "12px Arial";
      overlayCtx.fillText(
        latestPrice.toFixed(2),
        overlayCanvas.width - 60,
        overlayCanvas.height - y - 5
      );
    }

    // Draw time labels
    const timeLabels = data
      .filter((_, index) => index % 10 === 0) // Show every 10th label
      .map((candle) => new Date(candle.x).toLocaleTimeString());

    timeLabels.forEach((label, index) => {
      const x = (index / timeLabels.length) * overlayCanvas.width;
      overlayCtx.fillStyle = "#fff";
      overlayCtx.font = "12px Arial";
      overlayCtx.fillText(label, x, overlayCanvas.height - 5);
    });
    
    // Draw stop loss and take profit lines for each order
    orders.forEach((order) => {
      // Draw stop loss line if set
      if (order.stopLoss !== null) {
        const y =
          ((order.stopLoss - minPrice) / priceRange) * overlayCanvas.height;

        overlayCtx.strokeStyle = "#ff4000"; // Orange-red for stop loss
        overlayCtx.setLineDash([5, 3]); // Dashed line
        overlayCtx.beginPath();
        overlayCtx.moveTo(0, overlayCanvas.height - y);
        overlayCtx.lineTo(overlayCanvas.width, overlayCanvas.height - y);
        overlayCtx.stroke();
        overlayCtx.setLineDash([]); // Reset to solid line

        // Label for stop loss
        overlayCtx.fillStyle = "#ff4000";
        overlayCtx.font = "12px Arial";
        overlayCtx.fillText(
          `SL: ${order.stopLoss.toFixed(2)}`,
          overlayCanvas.width - 120,
          overlayCanvas.height - y - 5
        );
      }

      // Draw take profit line if set
      if (order.takeProfit !== null) {
        const y =
          ((order.takeProfit - minPrice) / priceRange) * overlayCanvas.height;

        overlayCtx.strokeStyle = "#00c853"; // Green for take profit
        overlayCtx.setLineDash([5, 3]); // Dashed line
        overlayCtx.beginPath();
        overlayCtx.moveTo(0, overlayCanvas.height - y);
        overlayCtx.lineTo(overlayCanvas.width, overlayCanvas.height - y);
        overlayCtx.stroke();
        overlayCtx.setLineDash([]); // Reset to solid line

        // Label for take profit
        overlayCtx.fillStyle = "#00c853";
        overlayCtx.font = "12px Arial";
        overlayCtx.fillText(
          `TP: ${order.takeProfit.toFixed(2)}`,
          overlayCanvas.width - 120,
          overlayCanvas.height - y - 5
        );
      }
    });
    
    // Draw order lines and labels
    orders.forEach((order) => {
      const y = ((order.price - minPrice) / priceRange) * overlayCanvas.height;

      // Draw order line
      overlayCtx.strokeStyle = order.type === "buy" ? "#26a69a" : "#ef5350"; // Green for Buy, Red for Sell
      overlayCtx.beginPath();
      overlayCtx.moveTo(0, overlayCanvas.height - y);
      overlayCtx.lineTo(overlayCanvas.width, overlayCanvas.height - y);
      overlayCtx.stroke();

      // Draw order label
      overlayCtx.fillStyle = order.type === "buy" ? "#26a69a" : "#ef5350";
      overlayCtx.font = "12px Arial";
      overlayCtx.fillText(
        `${order.type.toUpperCase()} ${order.quantity} @ ${order.price.toFixed(
          2
        )}`,
        10,
        overlayCanvas.height - y - 10
      );
    });
  };

  // Draw chart when data or orders change
  useEffect(() => {
    if (data.length > 0 && isInitializedRef.current) {
      drawChart();
    }
  }, [data, latestPrice, orders]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const overlayCanvas = overlayRef.current;
      if (!canvas || !overlayCanvas) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - orderSectionHeight - 60;
      overlayCanvas.width = window.innerWidth;
      overlayCanvas.height = window.innerHeight - orderSectionHeight - 60;

      const gl = glRef.current;
      if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      // Redraw the chart
      if (data.length > 0 && gl && programRef.current) {
        drawChart();
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once to set initial dimensions
    
    return () => window.removeEventListener("resize", handleResize);
  }, [orderSectionHeight]); // Only depend on orderSectionHeight

  // Modified placeOrder function
  const placeOrder = (type: "buy" | "sell") => {
    if (latestPrice === null) return;

    const orderId = generateOrderId();
    const order: Order = {
      id: orderId,
      type,
      quantity,
      price: latestPrice,
      stopLoss: null,
      takeProfit: null,
    };

    // Update balance based on order type
    if (type === "buy") {
      setBalance((prevBalance) => prevBalance - latestPrice * quantity);
    } else if (type === "sell") {
      setBalance((prevBalance) => prevBalance + latestPrice * quantity);
    }

    setOrders((prevOrders) => [...prevOrders, order]);
  };

  // Helper function to compile shaders
  const compileShader = (
    gl: WebGLRenderingContext,
    type: number,
    source: string
  ) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Could not create shader");

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  // Helper function to create a shader program
  const createProgram = (
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ) => {
    const program = gl.createProgram();
    if (!program) throw new Error("Could not create program");

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    return program;
  };

  // Helper function to draw a line
  const drawLine = (
    gl: WebGLRenderingContext,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: number[]
  ) => {
    const program = gl.getParameter(gl.CURRENT_PROGRAM);
    if (!program) return;

    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
    );
    const colorUniformLocation = gl.getUniformLocation(program, "u_color");

    const vertices = new Float32Array([x1, y1, x2, y2]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform4fv(colorUniformLocation, color);
    gl.drawArrays(gl.LINES, 0, 2);
  };

  // Helper function to draw a rectangle
  const drawRectangle = (
    gl: WebGLRenderingContext,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: number[]
  ) => {
    const program = gl.getParameter(gl.CURRENT_PROGRAM);
    if (!program) return;

    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
    );
    const colorUniformLocation = gl.getUniformLocation(program, "u_color");

    const vertices = new Float32Array([x1, y1, x2, y1, x1, y2, x2, y2]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform4fv(colorUniformLocation, color);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  
  const updateOrderStopLoss = (orderId: string, value: number) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, stopLoss: value } : order
      )
    );
  };

  // Function to update take profit for an order
  const updateOrderTakeProfit = (orderId: string, value: number) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, takeProfit: value } : order
      )
    );
  };
  
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Use the ChartHeader component */}
      <ChartHeader
        timeFrame={timeFrame}
        setTimeFrame={setTimeFrame}
        quantity={quantity}
        setQuantity={setQuantity}
        balance={balance}
        profitLoss={profitLoss}
        placeOrder={placeOrder}
      />

      {/* Chart Canvas - Dynamic height based on order section height */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: `calc(100vh - ${orderSectionHeight}px - 60px)`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight - orderSectionHeight - 60}
          style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
        />
        <canvas
          ref={overlayRef}
          width={window.innerWidth}
          height={window.innerHeight - orderSectionHeight - 60}
          style={{ position: "absolute", top: 0, left: 0, zIndex: 2 }}
        />
      </div>

      {/* Resize handle */}
      <div
        ref={resizeHandleRef}
        style={{
          width: "100%",
          height: "8px",
          backgroundColor: "#555",
          cursor: "ns-resize",
          position: "relative",
          zIndex: 10,
        }}
      />

      {/* Order management section with dynamic height */}
      <OrderManagement
        orders={orders}
        latestPrice={latestPrice}
        closeOrder={closeOrder}
        updateOrderStopLoss={updateOrderStopLoss}
        updateOrderTakeProfit={updateOrderTakeProfit}
        height={orderSectionHeight}
      />
    </div>
  );
};

export default WebGLCandlestickChart;