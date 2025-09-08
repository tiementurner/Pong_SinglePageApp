import React, {
	useContext,
	useEffect,
	useState } from 'react'
import { Socket, io } from 'socket.io-client'

import axios from '../../axiosInstance'
import { useAuth } from '../Authenticate/AuthProvider';
import { NotificationsContextType, SocketContextType } from '../../Types';

const NotificationSocketContext = React.createContext<NotificationsContextType>({socket: null, reload: false, setReload: null});

const NotificationSocketProvider = ({ children } : { children: React.ReactNode }) => {

    const [socket, setSocket] = useState<Socket | null>(null);
    const [authCode, setauthCode] = useState<string>('');
    const {authenticated} = useAuth();
    const [reconnect, setReconnect] = useState<boolean>(false)
    const [reload, setReload] = useState<boolean>(false);

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

    useEffect(() => {//renders twice
        if (socket) {
            socket.disconnect();
        }
        const newSocket = io(`${process.env.REACT_APP_SERVER_URL}/notification`, {
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
        <NotificationSocketContext.Provider value={{ socket, reload, setReload }}>
            {children}
        </NotificationSocketContext.Provider>
    ) 
}

export const useNotification = () => {
    return useContext(NotificationSocketContext);
}

export { NotificationSocketContext, NotificationSocketProvider };
