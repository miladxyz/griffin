// components/OrderManagement.tsx
import React, { useState } from "react";

type Order = {
  id: string; // Unique identifier for each order
  type: "buy" | "sell";
  quantity: number;
  price: number;
  stopLoss: number | null;
  takeProfit: number | null;
};

interface OrderManagementProps {
  orders: Order[];
  latestPrice: number | null;
  closeOrder: (orderId: string) => void;
  updateOrderStopLoss: (orderId: string, value: number) => void;
  updateOrderTakeProfit: (orderId: string, value: number) => void;
  height: number;
}

const OrderManagement: React.FC<OrderManagementProps> = ({
  orders,
  latestPrice,
  closeOrder,
  updateOrderStopLoss,
  updateOrderTakeProfit,
  height,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [stopLossPrice, setStopLossPrice] = useState<string>("");
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>("");

  // Luxury color palette
  const colors = {
    background: "#1A1A2E", // Deep navy background
    cardBg: "#16213E",     // Slightly lighter navy for card
    border: "#2A2A4A",     // Subtle border color
    text: "#E6E6FA",       // Soft lavender text
    textMuted: "#8A8AA3",  // Muted text
    gold: "#D4AF37",       // Gold accent
    silver: "#C0C0C0",     // Silver accent
    buyColor: "#4CAF82",   // Elegant green for buy
    sellColor: "#E57373",  // Refined red for sell
    buttonBg: "#2C2C54",   // Button background
    buttonHover: "#3B3B6D", // Button hover
    inputBg: "#2C2C54",    // Input background
    inputBorder: "#3F3F6D", // Input border
  };

  // Function to set stop loss for an order
  const setOrderStopLoss = (orderId: string) => {
    if (!stopLossPrice) return;

    const stopLossValue = parseFloat(stopLossPrice);
    if (isNaN(stopLossValue)) return;

    updateOrderStopLoss(orderId, stopLossValue);
    setStopLossPrice("");
    setSelectedOrderId(null);
  };

  // Function to set take profit for an order
  const setOrderTakeProfit = (orderId: string) => {
    if (!takeProfitPrice) return;

    const takeProfitValue = parseFloat(takeProfitPrice);
    if (isNaN(takeProfitValue)) return;

    updateOrderTakeProfit(orderId, takeProfitValue);
    setTakeProfitPrice("");
    setSelectedOrderId(null);
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: colors.cardBg,
        borderRadius: "8px",
        height: `${height - 8}px`, // Subtract the resize handle height
        overflowY: "auto",
        position: "relative",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        border: `1px solid ${colors.border}`,
      }}
    >
      <h3 style={{ 
        color: colors.gold, 
        margin: "0 0 15px 0", 
        fontWeight: 500,
        fontFamily: "'Playfair Display', serif",
        fontSize: "20px",
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: "10px",
        letterSpacing: "0.5px"
      }}>
        Portfolio Management
      </h3>

      <table
        style={{ 
          width: "100%", 
          color: colors.text, 
          borderCollapse: "separate", 
          borderSpacing: "0",
          fontFamily: "'Montserrat', sans-serif"
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                padding: "12px 8px",
                textAlign: "left",
                borderBottom: `1px solid ${colors.border}`,
                color: colors.silver,
                fontWeight: 400,
                fontSize: "13px",
                letterSpacing: "1px",
              }}
            >
              ID
            </th>
            <th
              style={{
                padding: "12px 8px",
                textAlign: "left",
                borderBottom: `1px solid ${colors.border}`,
                color: colors.silver,
                fontWeight: 400,
                fontSize: "13px",
                letterSpacing: "1px",
              }}
            >
              TYPE
            </th>
            <th
              style={{
                padding: "12px 8px",
                textAlign: "left",
                borderBottom: `1px solid ${colors.border}`,
                color: colors.silver,
                fontWeight: 400,
                fontSize: "13px",
                letterSpacing: "1px",
              }}
            >
              QTY
            </th>
            <th
              style={{
                padding: "12px 8px",
                textAlign: "left",
                borderBottom: `1px solid ${colors.border}`,
                color: colors.silver,
                fontWeight: 400,
                fontSize: "13px",
                letterSpacing: "1px",
              }}
            >
              PRICE
            </th>
            <th
              style={{
                padding: "12px 8px",
                textAlign: "left",
                borderBottom: `1px solid ${colors.border}`,
                color: colors.silver,
                fontWeight: 400,
                fontSize: "13px",
                letterSpacing: "1px",
              }}
            >
              STOP LOSS
            </th>
            <th
              style={{
                padding: "12px 8px",
                textAlign: "left",
                borderBottom: `1px solid ${colors.border}`,
                color: colors.silver,
                fontWeight: 400,
                fontSize: "13px",
                letterSpacing: "1px",
              }}
            >
              TAKE PROFIT
            </th>
            <th
              style={{
                padding: "12px 8px",
                textAlign: "left",
                borderBottom: `1px solid ${colors.border}`,
                color: colors.silver,
                fontWeight: 400,
                fontSize: "13px",
                letterSpacing: "1px",
              }}
            >
              P/L
            </th>
            <th
              style={{
                padding: "12px 8px",
                textAlign: "left",
                borderBottom: `1px solid ${colors.border}`,
                color: colors.silver,
                fontWeight: 400,
                fontSize: "13px",
                letterSpacing: "1px",
              }}
            >
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const profit = latestPrice
              ? order.type === "buy"
                ? (latestPrice - order.price) * order.quantity
                : (order.price - latestPrice) * order.quantity
              : 0;

            return (
              <tr key={order.id} style={{
                transition: "background-color 0.2s ease",
                ":hover": {
                  backgroundColor: "rgba(42, 42, 74, 0.4)"
                }
              }}>
                <td
                  style={{ 
                    padding: "12px 8px", 
                    borderBottom: `1px solid ${colors.border}`,
                    fontSize: "14px",
                  }}
                >
                  {order.id.substring(0, 6)}
                </td>
                <td
                  style={{
                    padding: "12px 8px",
                    borderBottom: `1px solid ${colors.border}`,
                    color: order.type === "buy" ? colors.buyColor : colors.sellColor,
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  {order.type.toUpperCase()}
                </td>
                <td
                  style={{ 
                    padding: "12px 8px", 
                    borderBottom: `1px solid ${colors.border}`,
                    fontSize: "14px",
                  }}
                >
                  {order.quantity}
                </td>
                <td
                  style={{ 
                    padding: "12px 8px", 
                    borderBottom: `1px solid ${colors.border}`,
                    fontSize: "14px",
                  }}
                >
                  ${order.price.toFixed(2)}
                </td>
                <td
                  style={{ 
                    padding: "12px 8px", 
                    borderBottom: `1px solid ${colors.border}`,
                    fontSize: "14px",
                  }}
                >
                  {selectedOrderId === order.id ? (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="text"
                        value={stopLossPrice}
                        onChange={(e) => setStopLossPrice(e.target.value)}
                        placeholder="Set SL price"
                        style={{
                          width: "100px",
                          padding: "8px 10px",
                          backgroundColor: colors.inputBg,
                          color: colors.text,
                          border: `1px solid ${colors.inputBorder}`,
                          borderRadius: "4px",
                          fontSize: "13px",
                          outline: "none",
                        }}
                      />
                      <button
                        onClick={() => setOrderStopLoss(order.id)}
                        style={{
                          marginLeft: "5px",
                          padding: "8px 12px",
                          backgroundColor: colors.buttonBg,
                          color: colors.text,
                          border: "none",
                          cursor: "pointer",
                          borderRadius: "4px",
                          fontSize: "13px",
                          transition: "background-color 0.2s ease",
                          ":hover": {
                            backgroundColor: colors.buttonHover
                          }
                        }}
                      >
                        Set
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ 
                        minWidth: "70px",
                        display: "inline-block"
                      }}>
                        {order.stopLoss
                          ? `$${order.stopLoss.toFixed(2)}`
                          : "—"} 
                      </span>
                      <button
                        onClick={() => setSelectedOrderId(order.id)}
                        style={{
                          marginLeft: "5px",
                          padding: "6px 10px",
                          backgroundColor: "transparent",
                          color: colors.silver,
                          border: `1px solid ${colors.border}`,
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          transition: "all 0.2s ease",
                          ":hover": {
                            backgroundColor: colors.buttonBg,
                            color: colors.text,
                          }
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </td>
                <td
                  style={{ 
                    padding: "12px 8px", 
                    borderBottom: `1px solid ${colors.border}`,
                    fontSize: "14px",
                  }}
                >
                  {selectedOrderId === order.id ? (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="text"
                        value={takeProfitPrice}
                        onChange={(e) => setTakeProfitPrice(e.target.value)}
                        placeholder="Set TP price"
                        style={{
                          width: "100px",
                          padding: "8px 10px",
                          backgroundColor: colors.inputBg,
                          color: colors.text,
                          border: `1px solid ${colors.inputBorder}`,
                          borderRadius: "4px",
                          fontSize: "13px",
                          outline: "none",
                        }}
                      />
                      <button
                        onClick={() => setOrderTakeProfit(order.id)}
                        style={{
                          marginLeft: "5px",
                          padding: "8px 12px",
                          backgroundColor: colors.buttonBg,
                          color: colors.text,
                          border: "none",
                          cursor: "pointer",
                          borderRadius: "4px",
                          fontSize: "13px",
                          transition: "background-color 0.2s ease",
                          ":hover": {
                            backgroundColor: colors.buttonHover
                          }
                        }}
                      >
                        Set
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ 
                        minWidth: "70px",
                        display: "inline-block"
                      }}>
                        {order.takeProfit
                          ? `$${order.takeProfit.toFixed(2)}`
                          : "—"}
                      </span>
                      <button
                        onClick={() => setSelectedOrderId(order.id)}
                        style={{
                          marginLeft: "5px",
                          padding: "6px 10px",
                          backgroundColor: "transparent",
                          color: colors.silver,
                          border: `1px solid ${colors.border}`,
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          transition: "all 0.2s ease",
                          ":hover": {
                            backgroundColor: colors.buttonBg,
                            color: colors.text,
                          }
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </td>
                <td
                  style={{
                    padding: "12px 8px",
                    borderBottom: `1px solid ${colors.border}`,
                    color: profit >= 0 ? colors.buyColor : colors.sellColor,
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  ${Math.abs(profit).toFixed(2)} {profit >= 0 ? "+" : "−"}
                </td>
                <td
                  style={{ 
                    padding: "12px 8px", 
                    borderBottom: `1px solid ${colors.border}`,
                    fontSize: "14px",
                  }}
                >
                  <button
                    onClick={() => closeOrder(order.id)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: colors.buttonBg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "13px",
                      transition: "all 0.2s ease",
                      ":hover": {
                        backgroundColor: colors.buttonHover,
                        borderColor: colors.text,
                      }
                    }}
                  >
                    Close
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Show message when no orders exist */}
      {orders.length === 0 && (
        <div style={{ 
          color: colors.textMuted, 
          textAlign: "center", 
          padding: "40px 20px",
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "14px",
          borderRadius: "6px",
          border: `1px dashed ${colors.border}`,
          margin: "20px 0",
          backgroundColor: "rgba(26, 26, 46, 0.3)",
        }}>
          No active positions in your portfolio. <br />
          Place a buy or sell order to begin trading.
        </div>
      )}
    </div>
  );
};

export default OrderManagement;