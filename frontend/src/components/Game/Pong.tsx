import '../../styling/GamePong.css';
import axios from '../../axiosInstance';
import io, { Socket } from 'socket.io-client';

import { useContext, useEffect, useState } from 'react';
import { PongLayout } from './Game';
import { PongGame } from './PongGame'

import { useParams } from 'react-router-dom';
import { useAuth } from '../Authenticate/AuthProvider';

export interface PongProps{
  socket:Socket|undefined;
  level:number
}

const enum RoomErrorMask {
	valid = 0,
	roomFull = 2,
	privateRoom = 4,
	invalid = 8
};

const ErrorRoom = (props: {error: number}) => {

	const errorMsg = {
		2: "Room is full.",
		4: "Room is private and you are not invited.",
		8: "Room does not exist or has expired"
	};

    return (
        <p>
			{errorMsg[props.error]}
        </p>
    )
  }

//Shared things between PongEasy and PongHard:
//init socket, get room information
//Different things between PongEasy and PongHard:
//Location paddles, scores

export function Pong():JSX.Element {

	const {roomnbr} = useParams();
  const auth = useAuth();
  const userID = String(auth.userId);
	const [socket, setSocket] = useState<Socket>();
	const [players, setPlayers] = useState({playerA: "", playerB: ""})
	const [level, setLevel] = useState<number>(0);
	const [validate, setValidate] = useState(0);
	const [reconnect, setReconnect] = useState<boolean>(false);
	const [authCode, setauthCode] = useState<string>('');
 
  useEffect(() => {
    const connect = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/auth/socketAuth`);
        setauthCode(response.data);
      } catch (error) {}
    }
    connect();

  }, [reconnect]);

  useEffect(() => {
    const newSocket = io(`${process.env.REACT_APP_SERVER_URL}/game`, {
      extraHeaders: {authorization: authCode},
      reconnection: true   
    });
    newSocket.emit("userID", {userID:userID, roomnbr: 0});
    setSocket(newSocket);
    newSocket.on('disconnect', () => {
      setReconnect(prev => !prev);
    })
    return () => {
      newSocket.disconnect();
    };
  }, [authCode, userID])

//at the start send the message to server that a player entered pong game

  useEffect(() => {
      socket?.emit("JoinRoom", {roomnbr:Number(roomnbr), userID:userID});
    }, [socket, roomnbr, userID]);

  useEffect(() => {
    
    socket?.on(`valid`, () => {
		setValidate(RoomErrorMask.invalid)
    }) 
    socket?.on('RoomFull', () =>{
		setValidate(RoomErrorMask.roomFull);
    });
    socket?.on('privateRoom', () =>{
		setValidate(prev => prev |= RoomErrorMask.privateRoom)
    });
    return () => {
    	socket?.off(`valid`);
    	socket?.off(`RoomFull`);
    	socket?.off(`privateRoom`);
    };
}, [socket]);

  useEffect(() => {
    socket?.on(`roomlevel`, (data) => {
      console.log("roomlevel received: ", data);
      setLevel(data);
    }) 
    return () => {
      socket?.off(`roomlevel`);
    };
  }, [socket, level]);

//update the players regularly
  useEffect(() => {
    socket?.on(`players${roomnbr}`, (data) => {
		setPlayers({
			playerA: data.playerA,
			playerB: data.playerB
		})
    });
    return () => {
      socket?.off(`players${roomnbr}`);
    };
  }, [socket, players, roomnbr]);

  useEffect(() => {
    socket?.on(`LeaveGame${roomnbr}`, (data) => {
		const playerA = players.playerA;
		const playerB = players.playerB;
      if (data === "A")
        setPlayers({playerA: "", playerB: playerB})
      else if (data === "B")
        setPlayers({playerA: playerA, playerB: ""})
    });
    return () => {
      socket?.off(`LeaveGame${roomnbr}`);
    };
}, [socket, players, roomnbr]);
//naomi
return (<div>
		{ !validate && level &&
			<PongLayout
				playerA={players.playerA}
				playerB={players.playerB}
				socket={socket}
				level={level}
			/>}
		{ !level && validate && <ErrorRoom error={validate} /> }
	</div>
)
}
