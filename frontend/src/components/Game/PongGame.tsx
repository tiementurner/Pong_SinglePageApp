import React, { useState, useEffect, useCallback } from 'react';
import {RenderEasy, RenderHard} from './RenderParameter';
import { Coordinate, Render } from './GameRender';
import { useParams } from 'react-router-dom';
import { PongProps } from './Pong';
import { RenderLevel2 } from './GameRenderHard';
import { useAuth } from '../Authenticate/AuthProvider';


export const useBackButtonWarning = () => {
  const message = 'Leaving mid game might cause you to loose.';

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      return message;
    };

    const handlePopState = () => {
      if (window.confirm(message)) {
        window.history.go(-2);
      } else {
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    window.history.pushState(null, '', window.location.pathname);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
};

function renderElement(level:number):Render|RenderLevel2|null{
  let playfield: Render |RenderLevel2|null= null;
  if (level === 1){
    playfield = new Render(
      RenderEasy.fieldWidth, 
      RenderEasy.fieldHeight,
      RenderEasy.divisionLineWidth, RenderEasy.lineColor, 
      RenderEasy.paddleWidth, 
      RenderEasy.paddleHeight, 
      RenderEasy.paddleColor, 
      RenderEasy.ballDiameter, 
      RenderEasy.ballColor, 
      RenderEasy.gateWidth, 
      RenderEasy.gateDepth, 
      RenderEasy.paddleOffset, 
      1.5);
    }
  else if (level === 2){
    playfield = new RenderLevel2(
      RenderHard.fieldWidth, 
      RenderHard.fieldHeight,
      RenderHard.divisionLineWidth, 
      RenderHard.lineColor, 
      RenderHard.paddleWidth, 
      RenderHard.paddleHeight, 
      RenderHard.paddleColor, 
      RenderHard.ballDiameter, 
      RenderHard.ballColor, 
      RenderHard.gateWidth, 
      RenderHard.gateDepth, 
      RenderHard.paddleOffset, 
      1.5,
      RenderHard.middleBlocks,
      RenderHard.fieldBlocks,
      RenderHard.blockWidth,
      RenderHard.blockHeight);
  }
  return playfield;
}

export interface gameVars {
  paddleA: number,
  paddleB: number,
  ball: Coordinate
};

const initGameVars: gameVars = {
  paddleA: (RenderEasy.fieldHeight - RenderEasy.paddleHeight) / 2,
  paddleB: (RenderEasy.fieldHeight - RenderEasy.paddleHeight) / 2,
  ball: new Coordinate(RenderEasy.fieldWidth / 2, RenderEasy.fieldHeight / 2)
};

//the Pong game should look up the room information in the backup as soon as it is started
export function PongGame({socket, level}: PongProps):JSX.Element{
  const playfield:Render|RenderLevel2|null = renderElement(level);
  if (!playfield){
    throw Error("Level must be 1 or 2");
  }
  const {roomnbr} = useParams();
  const userID = String(useAuth().userId);
  const [gameVars, setGameVars] = useState<gameVars>(initGameVars);
  const [stat, setStat] = useState<number>(0);
  const [scoreA, setScoreA] = useState<number>(0);
  const [scoreB, setScoreB] = useState<number>(0);
  const [lastHeartbeat,setLastHeartbeat] = useState<number>(Date.now()); //time last heartbeat is heart
  const [lastPulse, setLastPulse] = useState<number>(Date.now());
  const [keyPressed, setKeyPressed] = useState<boolean>(false);

//-------------------establish socket connection -----------------------
  useEffect(() => {
    socket?.on("GameInfo", (data:{scoreA:number, scoreB:number, stat:number})=>{
      setStat(data.stat);
      setScoreA(data.scoreA);
      setScoreB(data.scoreB);
    })
    const intervalID:NodeJS.Timeout|null = setInterval(()=>{
      socket?.emit('GameHeartbeat', {userID:userID});
      setLastHeartbeat(Date.now());
    //   console.log("heartbeat sent");
    }, 2000);
    return () => {
      clearInterval(intervalID);
    };
  }, [socket, userID]);



  useEffect(()=>{
    socket?.on(`GamePulse`, (data)=>{
        setLastPulse(Date.now());
        if (stat != 0 && stat!=1)
          setStat(data);
        // console.log('Game Pulse received:time', lastPulse)
    });
  return (()=>{
      socket?.off(`GamePulse`);
      });
  },[socket, lastPulse]);


  useEffect(()=>{
    if (lastHeartbeat-lastPulse > 5000){
        setStat(5);
    }
  },[lastHeartbeat, socket, lastPulse]);

  useEffect(() => {
    socket?.on(`gamestat${roomnbr}`, (data) => {
      if (data > 1 || stat === 3)
        setStat(data);
    });
    return () => {
      socket?.off(`gamestat${roomnbr}`);
    };
  }, [socket, stat, roomnbr]);

  useEffect(() => {
    socket?.on(`LeaveGame${roomnbr}`, (data) => {
      if (data === "A")
        setScoreA(0);
      else if (data === "B")
        setScoreB(0);
    });
    return () => {
      socket?.off(`LeaveGame${roomnbr}`);
    };
  }, [socket, scoreA, scoreB, roomnbr]);

//------------get scores in room-----------------
  useEffect(() => {
    socket?.on(`score${roomnbr}`, (data) => {
        setScoreA(data.scoreA);
        setScoreB(data.scoreB);
    });
    return () => {
      socket?.off(`score${roomnbr}`);
    };
  }, [socket, roomnbr]);

//update the players regularly

  //-------------------------key related functions---------------------------//
  const sendContinuousMessage = useCallback((key: string) => {
    // Send a message every 10ms while the key is pressed
    setKeyPressed(true);
    const intervalId = setInterval(() => {
      socket?.emit(key, {userID:userID, roomnbr:Number(roomnbr)});
    }, 10);

    // Clear the interval when the key is released
    const handleKeyUp = () => {
      clearInterval(intervalId);
      window.removeEventListener('keyup', handleKeyUp);
      setKeyPressed(false);
    };
    window.addEventListener('keyup', handleKeyUp);
  }, [socket, userID, roomnbr]);


  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if ((event.key === 'ArrowUp'|| event.key ==='ArrowDown')&&keyPressed === false)
      {
        if (stat === 2)
          sendContinuousMessage(`${event.key}`);
      }
      else if (event.key === 'Enter'){
        if (stat === 0){
          socket?.emit('start', {userID:userID, roomnbr:Number(roomnbr)});
          setStat(1);
        }
      }
  };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [roomnbr, sendContinuousMessage, userID, socket, stat, keyPressed]);

  useEffect(() => {
    socket?.on(`GameStart${userID}`, (data) => {
      setStat(2);
    });
    return () => {
      socket?.off(`GameStart${userID}`);
    };
  }, [socket, userID]);

  
  useBackButtonWarning();

//------------------update the position of the ball------------------------
  useEffect(() => {
    socket?.on(`GameVar${roomnbr}`, (data) => {
		setGameVars({
			paddleA: data.paddleA,
			paddleB: data.paddleB,
			ball: data.ball
		})
		  // setPaddleA(data.paddleA);
      // setPaddleB(data.paddleB);
      // setBall(data.ball);
    });
    return () => {
      socket?.off(`GameVar${roomnbr}`);
    };
  }, [socket, roomnbr]);

  return (<div className="pong-game">
    {socket?.disconnected?"You have timed out":
    stat === 2 ? playfield.drawGame(gameVars.ball, gameVars.paddleA, gameVars.paddleB, scoreA, scoreB):playfield.drawStatic(stat, scoreA, scoreB)}
  </div>);

}
