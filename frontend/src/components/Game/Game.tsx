import { Outlet } from 'react-router-dom';

import { RoomInterface } from './RoomInterface';
import { Pong } from './Pong';
// import PrivateGame from '../PrivateGame/PrivateGame';
import { useAccordionButton } from 'react-bootstrap';
import { useAuth } from '../Authenticate/AuthProvider';
import { Socket } from 'socket.io-client';
import Instructions from './GameInstructions';
import { PongGame } from './PongGame';




const Game = () => {
	return (
			<Outlet />
	)
}


export default Game;

// className='RenderGame' style={{
// 	display: 'flex',
// 	alignItems: 'center',
// 	flexDirection: 'column', 
// 	height: '100vh', 
// 	width: '100vw'
//   }}>

export const PongLayout = (props: {playerA: string, playerB: string, socket: Socket, level: number}) => {

	return (
		<div className="pong-container">
			<Instructions />
			<p>playerA: {props.playerA} playerB: {props.playerB}</p>
			 <PongGame socket={props.socket} level={props.level}/>
		
			
		</div>
	)
}
  


