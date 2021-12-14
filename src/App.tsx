import React, {useEffect, useState} from 'react';
import {Game, Line} from "./logic/Game";

function App() {
  const [game, setGame] = useState(new Game({w: 400, h:300}));
  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    const update = () => {
      let now = Date.now();
      game.move((now - time) / 1000);
      setTime(now);
      setTimeout(update, 1000);
    }
    setTimeout(update, 1000);

  }, [])

  return (
    <div style={{width: 400, height: 300, position: "relative"}}>
      <div key={time} style={{width: 40, height: 40, background: "blue",
        position: "absolute", bottom: game.ball.y, left: game.ball.x
      }}/>
    </div>
  );
}

export default App;
