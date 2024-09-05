//this file handles starting the heartbeat connection and get requests for status

//Status: Online
//Status: In chat
//Status: In game
//Status: Offline
//Status: Away(if there is no activity for longer than)

import React, {
	useState,
	useEffect,
	useCallback,
	useContext,
	createContext,
	useRef } from "react";
import {
	io,
	Socket } from "socket.io-client";
import { useAuth } from "../Authenticate/AuthProvider";
import axios from '../../axiosInstance'

export interface StatusContextType {
    socket: Socket|null;
    setSocket: React.Dispatch<React.SetStateAction<Socket|null>>;
}

export type StatusContextProps ={
    children:React.ReactNode;
  }

export const StatusContext = createContext<StatusContextType|undefined>(undefined);

export const MyStatusProvider = ({children}:StatusContextProps) => {
	const userStatusRef = useRef("Online");
	const lastActivityRef = useRef(Date.now());
    const userID:string = useAuth().userId.toString();
    const [socket, setNewSocket] = useState<Socket | null>(null);
	const [authCode, setauthCode] = useState<string>('');
	const [reconnect, setReconnect] = useState<boolean>(false);
	const {authenticated} = useAuth();

    // Establish connection
    useEffect(() => {
        const connect = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/auth/socketAuth`);
                setauthCode(response.data)
            } catch (error: any) {
				//console.log("Error connecting to notification socket: ", error.data.response.message);
			}
        }
        connect();
    },[authenticated, reconnect])

    useEffect(() => {
        if (socket) {
            socket.disconnect();
        }
        const newSocket = io(`${process.env.REACT_APP_SERVER_URL}/status`, {
            extraHeaders: {authorization: authCode},
            reconnection: false
        });
		if (newSocket) {
			setNewSocket(newSocket);
			newSocket.emit('newSocket', { userID: userID})
		} else {
			throw new Error('Socket connection cannot be established.');
		}
        newSocket.on('disconnect', () => {
            setReconnect(prev => !prev);
        })

        return () => {
            newSocket.disconnect();
        };
        
    }, [authCode]);

    useEffect(() => {
		if (userID !== "0")
			{
				const intervalID = setInterval(() => {
					if (lastActivityRef.current - Date.now() < 1000)
						socket?.emit("Heartbeat", {userID: userID, activity: true});
					else
						socket?.emit("Heartbeat", {userID: userID, activity: false});
				}, 1000);//once per second
				return () => clearInterval(intervalID);
			}
    }, [socket, userID]);

    const handleActivity = useCallback(() => {
        if (userID !== "0")
			lastActivityRef.current = Date.now();
			// setLastActivity(Date.now());
    }, [userID]);

    useEffect(() => {
		if (userID !== "0")
			{
				window.addEventListener('keydown', handleActivity);
				window.addEventListener('mousemove', handleActivity);
				window.addEventListener('mousedown', handleActivity);
				return () => {
				  window.removeEventListener('keydown', handleActivity);
				};
			}
    }, [handleActivity, userID]);

    useEffect(() => {
		if (userID !== "0")
			{
				const handleUserStatus = (data: string) => {
					userStatusRef.current = data;
				};
				socket?.on(`userStatus${userID}`, handleUserStatus);
				return () => {
					socket?.off(`userStatus${userID}`, handleUserStatus);
				};
			}
    }, [socket, userID]);

    return (
		<StatusContext.Provider value ={{socket:socket, setSocket: setNewSocket }}>
			{children}
		</StatusContext.Provider>
    );
}

export const useStatusContext = (): StatusContextType => {
    const context = useContext(StatusContext);
    if (!context) {
        throw new Error('useStatusContext must be used within a StatusProvider');
    }
    return context;
};
