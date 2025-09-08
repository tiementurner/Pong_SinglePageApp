import React, { useContext, useEffect, useState } from 'react'
import { Socket, io } from 'socket.io-client'
import axios from '../../axiosInstance'
import { SocketContextType } from '../../Types'

const SocketContext = React.createContext<SocketContextType>({socket: null});

export const ChatSocketProvider = ({ children } : { children: React.ReactNode }) => {

    const [socket, setSocket] = useState<Socket | null>(null);
    const [authCode, setauthCode] = useState<string>('');
    const [reconnect, setReconnect] = useState<boolean>(false);

    useEffect(() => {
        const connect = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/auth/socketAuth`);
                setauthCode(response.data)
            } catch (error) {}
        }
        connect();
    },[reconnect])

    useEffect(() => {//renders twice
        if (socket) {
            socket.disconnect();
        }
        const newSocket = io(`${process.env.REACT_APP_SERVER_URL}/chat`, {
            extraHeaders: {authorization: authCode},
            reconnection: false
        });
        setSocket(newSocket);
        newSocket.on('disconnect', () => {
            setReconnect(prev => !prev);
        })
        return () => {
            newSocket.disconnect();
        };
        
    }, [authCode]);


    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    ) 
}

export const useSocket = () => {
    return useContext(SocketContext);
}
