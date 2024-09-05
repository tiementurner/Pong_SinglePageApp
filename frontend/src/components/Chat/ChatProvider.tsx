import {
	useState,
	useContext,
	createContext } from 'react';
import {
	ChatContextType,
	AddChannel,
	AddMessage,
	Channel,
	Message } from '../../Types';

const ChatContext = createContext<ChatContextType>(null!);

const ChatProvider = ( { children } : { children: React.ReactNode }) => {
	const [sentMsgs, setSentMsgs] = useState<Message[]>([]);
	const [channels, setChannels] = useState<Channel[]>([]);

	const addMessage: AddMessage = async (message: Message) => {
		
		if (message.content.trim() === '')
			return {status: 400};
	
		setSentMsgs((prevMessages) => [
		  ...prevMessages, message
		]);

		return {status: 200}
	};

	const addChannel: AddChannel = (id: number, name: string) => {
		setChannels((prevChannels) => [
			...prevChannels,
			{ id: id, name: name, msgs: [] },
		]);
	};

	return (
		<ChatContext.Provider value={{channels, addChannel, sentMsgs, setSentMsgs, addMessage}}>
			{ children }
		</ChatContext.Provider>
	)
}

export default ChatProvider;

export const useChat = () => {
	return useContext(ChatContext);
}
