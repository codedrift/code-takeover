import { add } from "date-fns";
import { useRef, useState } from "react";
import { useTimer } from "react-timer-hook";
import styles from "./App.module.css";

// a 30x30 board with coorinates from 0 to 29 (30x30) starting top left with coordinates as objects with x and y properties

const CELL_SIZE = 20;
const BOARD_SIZE = 30;

const BOARD = Array.from({ length: BOARD_SIZE }, (_, y) =>
  Array.from({ length: BOARD_SIZE }, (_, x) => ({ x, y, owner: null }))
).flat();

type Cell = { x: number; y: number; owner?: string | null };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function App() {
  const [board, setBoard] = useState<Cell[]>(BOARD);
  const finished = useRef(false);

  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({
    expiryTimestamp: add(new Date(), { seconds: 5 }),
    onExpire: () => {
      finished.current = true;
      return console.warn("onExpire called");
    },
    autoStart: false,
  });

  const updatePoint = async (player: string, x: number, y: number) => {
    setBoard((board) =>
      board.map((c) => {
        if (c.x === x && c.y === y) {
          return { ...c, owner: player };
        }
        return c;
      })
    );
    await sleep(100);
  };

  const takeover3 = async () => {
    try {
      for (const cell of board) {
        if (finished.current) {
          throw new Error("finished");
        }
        await updatePoint("green", cell.x, cell.y);
      }
    } catch (error) {}
  };

  const takeover = async () => {
    try {
      let x = 0;
      let y = 0;
      let step = 0;
      let d0s = 0;
      let d1s = 0;
      let d2s = 0;
      let d3s = 0;
      while (true) {
        if (finished.current) {
          throw new Error("finished");
        }
        await updatePoint("blue", x, y);
        if (step % 4 === 0) {
          if (x < BOARD_SIZE - 1 - d0s) {
            x++;
            continue;
          } else {
            step++;
            d0s++;
            d3s++;
          }
        }
        if (step % 4 === 1) {
          if (y < BOARD_SIZE - 1 - d1s) {
            y++;
            continue;
          } else {
            step++;
            d1s++;
          }
        }
        if (step % 4 === 2) {
          if (x > 0 + d2s) {
            x--;
            continue;
          } else {
            step++;
            d2s++;
          }
        }
        if (step % 4 === 3) {
          if (y > 0 + d3s) {
            y--;
            continue;
          } else {
            step++;
            // d3s++;
          }
        }
      }
    } catch (error) {}
  };

  const takeover2 = async () => {
    try {
      while (true) {
        if (finished.current) {
          throw new Error("finished");
        }
        const rX = Math.floor(Math.random() * BOARD_SIZE);
        const rY = Math.floor(Math.random() * BOARD_SIZE);
        await updatePoint("red", rX, rY);
      }
    } catch {}
  };
  // console.log({ board });

  const startTakeover = async () => {
    restart(add(new Date(), { seconds: 90 }));
    await Promise.all([takeover(), takeover2(), takeover3()]);
  };
  return (
    <div className={styles.root}>
      <div
        style={{
          position: "relative",
          border: "1px solid red",
          margin: "0 auto",
          width: `${BOARD_SIZE * CELL_SIZE}px`,
          height: `${BOARD_SIZE * CELL_SIZE}px`,
        }}
      >
        {board.map((cell) => (
          <div
            key={`${cell.x}-${cell.y}`}
            style={{
              position: "absolute",
              fontSize: "8px",
              backgroundColor: cell.owner
                ? cell.owner
                : "rgba(255,255,255,0.1)",
              left: `${cell.x * CELL_SIZE}px`,
              top: `${cell.y * CELL_SIZE}px`,
              width: `${CELL_SIZE}px`,
              height: `${CELL_SIZE}px`,
            }}
          >
            {cell.x}/{cell.y}
          </div>
        ))}
      </div>
      <div className={styles.score}>
        <div>
          <h3>Score "red"</h3>
          {board.filter((cell) => cell.owner === "red").length}
        </div>
        <div>
          <h3>Score "green"</h3>
          {board.filter((cell) => cell.owner === "green").length}
        </div>
        <div>
          <h3>Score "blue"</h3>
          {board.filter((cell) => cell.owner === "blue").length}
        </div>
        <div>{seconds}</div>
      </div>
      <button onClick={startTakeover}>start</button>
    </div>
  );
}

export default App;
