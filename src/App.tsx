import React, {useEffect, useState} from 'react';
import {Game} from "./logic/Game";
import {Line} from "./logic/Line";

//zdje sobie srawę ze tak się tego nie robi ale po 3.5h męczenia się z liczeniem
// przecięć prostych i kątów odbicia i faktem że js to przepiękny język
// nie mam siły żeby zrobić to normalnie
const updateTime = 16.6
let keys: string[] = []
let pos = {p1: 100, p2: 100}
let p1SC = 1;
let p2SC = 1;

function App() {
  const [game, setGame] = useState(new Game({w: 400, h:300}));
  const [time, setTime] = useState(Date.now());
  const [p1, setP1] = useState<number>(0);
  const [p2, setP2] = useState<number>(0);



  useEffect(() => {
    console.log("added effect")
    window.addEventListener("keydown", (e: KeyboardEvent) => {
      keys.push(e.key)
    })
    window.addEventListener("keyup", (e: KeyboardEvent) => {
      keys = keys.filter(k => k !== e.key)
    })

    const update = () => {
      pos = {p1: keys.includes("w")? pos.p1 + 4:
          keys.includes("s")? pos.p1 - 4: pos.p1,
        p2: keys.includes("o")? pos.p2 + 4:
          keys.includes("l")? pos.p2 - 4: pos.p2
      }

      game.p1 = pos.p1;
      game.p2 = pos.p2;
      let score = game.move((updateTime) / 16.6);
      if(score === "p1") {
        setP1(p1SC++)
        game.resetBall()
      } else if(score === "p2"){
        setP2(p2SC++)
        game.resetBall()
      }


      setTime(Date.now());
      setTimeout(update, updateTime);
    }

    setTimeout(update, updateTime);

  }, [])

  return (
    <>
      <h1>Użwaj w i s dla p1 oraz o i l dla p2</h1>
    <h1>P1:{p1}, P2: {p2}</h1>
    <div style={{width: 400, height: 300, position: "relative", left: 100, top: 100,
      border: "2px solid black"}}>
      <div key={time} style={{width: 10, height: 10, background: "blue",
        position: "absolute", bottom: game.ball.y - 5, left: game.ball.x - 5, borderRadius: "100%"
      }}/>

      <div style={{borderLeft: "3px solid black", width: 1, height: 100,
        position: "absolute", left: 10, bottom: pos.p1}}/>
      <div style={{borderLeft: "3px solid black", width: 1, height: 100,
        position: "absolute", right: 10, bottom: pos.p2}}/>

      <div style={{borderLeft: "5px solid blue", width: 1, height: 100,
        position: "absolute", left: 0, bottom: 100}}/>
      <div style={{borderLeft: "5px solid blue", width: 1, height: 100,
        position: "absolute", right: 0, bottom: 100}}/>
    </div>
    </>
  );
}

export default App;
