import React, { useState } from 'react';
import axios from 'axios'; 
import { useAuth } from '../Authenticate/AuthProvider';

//The private game tab gives a button, when clicked a new room is generated 

function PrivateGame() {
    const [gameLink, setGameLink] = useState<string>("");
    const [level, setLevel] = useState<number>(1);
    const userID: string = String(useAuth().userId);

    const createGame = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/createprivateroom`, { userID:userID, level:level }); // Send POST request with Axios

            const data = response.data;
            const roomnbr = data.roomnbr; 
            setGameLink(`${process.env.REACT_APP_URL}/pong/${roomnbr}`); 
        } catch (error) {
            console.error('Error creating game:', error);
        }
    };

    const handleLevel = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setLevel(+event.target.value);
    };

    return (
        <div>
            <div>
                <label>Select Difficulty: </label>
                <select value={level} onChange={handleLevel}>
                    <option value= "1" >Easy</option>
                    <option value= "2" >Hard</option>
                </select>
            </div>
            <button onClick={createGame}>Create Private Game</button>
            {gameLink && (
                <p>Game Link: <a href={gameLink}>{gameLink}</a></p>
            )}
        </div>
    );
}

export default PrivateGame;