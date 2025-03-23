// components/ChartHeader.tsx
"use client";

import { Dispatch, SetStateAction } from "react";

const timeFrames = [
  "1m",
  "5m",
  "15m",
  "30m",
  "1h",
  "4h",
  "1d",
  "1w",
  "1M",
] as const;
type TimeFrame = (typeof timeFrames)[number];

interface ChartHeaderProps {
  timeFrame: TimeFrame;
  setTimeFrame: Dispatch<SetStateAction<TimeFrame>>;
  quantity: number;
  setQuantity: Dispatch<SetStateAction<number>>;
  balance: number;
  profitLoss: number;
  placeOrder: (type: "buy" | "sell") => void;
}

const ChartHeader = ({
  timeFrame,
  setTimeFrame,
  quantity,
  setQuantity,
  balance,
  profitLoss,
  placeOrder,
}: ChartHeaderProps) => {
  return (
    <div
      style={{
        backgroundColor: "#16213E",
        padding: "12px 16px",
        borderRadius: "8px",
        borderBottom: "1px solid #2A2A4A",
        marginBottom: "15px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <label
            style={{
              color: "#C0C0C0",
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            Time Frame:
          </label>
          <select
            onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
            style={{
              padding: "6px 10px",
              borderRadius: "4px",
              border: "1px solid #3F3F6D",
              backgroundColor: "#2C2C54",
              color: "#E6E6FA",
              fontSize: "13px",
              fontFamily: "'Montserrat', sans-serif",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {timeFrames.map((tf) => (
              <option key={tf} value={tf}>
                {tf}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginLeft: "15px",
          }}
        >
          <label
            style={{
              color: "#C0C0C0",
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            Qty:
          </label>
          <input
            type="number"
            onChange={(e) => setQuantity(parseFloat(e.target.value))}
            min="1"
            style={{
              padding: "6px 10px",
              borderRadius: "4px",
              border: "1px solid #3F3F6D",
              backgroundColor: "#2C2C54",
              color: "#E6E6FA",
              width: "70px",
              fontSize: "13px",
              fontFamily: "'Montserrat', sans-serif",
              outline: "none",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginLeft: "15px",
          }}
        >
          <button
            onClick={() => placeOrder("buy")}
            style={{
              padding: "6px 16px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#2C4F3F",
              color: "#E6E6FA",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              fontFamily: "'Montserrat', sans-serif",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#356d59")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#2C4F3F")
            }
          >
            Buy
          </button>

          <button
            onClick={() => placeOrder("sell")}
            style={{
              padding: "6px 16px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#633838",
              color: "#E6E6FA",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              fontFamily: "'Montserrat', sans-serif",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#7c4747")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#633838")
            }
          >
            Sell
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            backgroundColor: "#1A1A2E",
            borderRadius: "4px",
            padding: "6px 12px",
            border: "1px solid #2A2A4A",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "#C0C0C0",
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "12px",
              fontWeight: 400,
              marginRight: "6px",
            }}
          >
            Balance:
          </span>
          <span
            style={{
              color: "#D4AF37",
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            ${balance.toFixed(2)}
          </span>
        </div>

        <div
          style={{
            backgroundColor: "#1A1A2E",
            borderRadius: "4px",
            padding: "6px 12px",
            border: "1px solid #2A2A4A",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "#C0C0C0",
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "12px",
              fontWeight: 400,
              marginRight: "6px",
            }}
          >
            P/L:
          </span>
          <span
            style={{
              color: profitLoss >= 0 ? "#4CAF82" : "#E57373",
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            ${Math.abs(profitLoss).toFixed(2)} {profitLoss >= 0 ? "+" : "−"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChartHeader;
