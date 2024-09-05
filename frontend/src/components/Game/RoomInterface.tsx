import React, { useState, useEffect } from 'react';
import axios from '../../axiosInstance';
import './RoomInterface.css';
import Button from 'react-bootstrap/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Authenticate/AuthProvider';
// import { GC } from './Game';

export class Room{
    playerA:string;
    playerB:string;
    usernameA: string;
    usernameB: string;
    roomnbr:number;
    level:number;
    isPrivate:boolean;
    constructor(
        playerA:string, 
        playerB:string, 
        roomnbr:number, 
        level:number, 
        isPrivate:boolean, 
        usernameA: string, 
        usernameB: string
    ){
            this.playerA = playerA;
            this.playerB = playerB;
            this.usernameA = usernameA;
            this.usernameB = usernameB;
            this.roomnbr = roomnbr;
            this.level = level;
            this.isPrivate = isPrivate;
    }
    public setPlayerA(playerA:string){
        this.playerA = playerA;
    }
    public setPlayerB(playerB:string){
        this.playerB = playerB;
    }
}

export function RoomInterface (){

    const userID:string = String(useAuth().userId);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [playroom, setPlayroom] = useState<Room|null>(null);
    const navigate = useNavigate();

    const getRooms = async()=>{
        try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/rooms`);
            const responsePrivate = await axios.get(`${process.env.REACT_APP_SERVER_URL}/privaterooms`);
            const roomData = [...response.data, ...responsePrivate.data];
            if (roomData){
                console.log(roomData)
                const roomsList = roomData.map((room: any) => new Room(
                    room.playerA, 
                    room.playerB, 
                    room.roomnbr, 
                    room.level, 
                    room.isPrivate,
                    room.usernameA,
                    room.usernameB
                ));
                setRooms(roomsList);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    }

    const createEasyRoom = async()=>{
        try {
            await axios.post(`${process.env.REACT_APP_SERVER_URL}/create`,{ userID:userID, level:1 });
            getRooms();
        } catch (error){
            console.error('Error creating room:', error);
        }
    }

    const createHardRoom = async()=>{
        try {
            await axios.post(`${process.env.REACT_APP_SERVER_URL}/create`,{ userID:userID, level:2 });
            getRooms();
        } catch (error){
            console.error('Error creating room:', error);
        }
    }

    const randomJoin = async()=>{
        try {
            await axios.post(`${process.env.REACT_APP_SERVER_URL}/randomjoin`,{ userID:userID, level:2 });
            getRooms();
        } catch (error){
            console.error('Error joining room:', error);
        }
    }

    useEffect(()=>{
        const intervalId = setInterval(getRooms, 2500);
        if (playroom!=null)
            clearInterval(intervalId);
        return () => clearInterval(intervalId);
    },[playroom]);

    useEffect(()=>{
        const findRoom = (userID:string):Room|null=>{
            for (let i:number = 0; i < rooms.length; i+=1){
                if ((rooms[i].playerA === userID || rooms[i].playerB === userID) && rooms[i].isPrivate !== true)
                    return (rooms[i]);
            }
            return (null);
        }
        setPlayroom(findRoom(userID));
    },[rooms, userID]);

    useEffect(() => {
        if (playroom) {
          navigate(`/game/pong/${playroom.roomnbr}`);
        }
      }, [playroom, navigate]);

    //player enters game environment (see rooms click on there and get all info)
    //player clicks on 'create room' and enters the room directly
    //if the connection is lost for longer than 3 sec, then the person is removed from the room.
    return (
        <div>
            <div className='title'>Join Game</div>
            <Button variant='outlined' className="navy-button" onClick={randomJoin}>Find match</Button>
            <Button variant='outlined' className="navy-button" onClick={createEasyRoom}>Create Easy Room</Button>
            <Button variant='outlined' className="navy-button" onClick={createHardRoom}>Create Hard Room</Button>
            <div className='Rooms'>
                {rooms.map((room, index) => {
                    const isLinkActive = room.playerA === null || room.playerB === null || room.isPrivate;
                    const roomContent = (
                        <Button variant='outlined' className={`roomButton${room.level}`}>
                            <div className={`roomInfo${room.level}`}>
                                {room.isPrivate && (<div>PRIVATE</div>)}
                                <div>Room Number: {room.roomnbr}</div>
                                <div>Player A: {room.usernameA}</div>
                                <div>Player B: {room.usernameB}</div>
                                <div>Level: {room.level === 1 ? 'Easy' : 'Hard'}</div>
                            </div>
                        </Button>
                    );

                    return (
                        <div key={index}>
                            {isLinkActive ? (
                                <Link to={`/game/pong/${room.roomnbr}`}>
                                    {roomContent}
                                </Link>
                            ) : (
                                roomContent
                            )}
                        </div>
                    );
                })}
            </div>
			<div className="liwen-container"/>
        </div>
        );
}
