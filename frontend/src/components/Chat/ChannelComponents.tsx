import React, {
	FormEvent,
	useEffect,
	useState } from 'react';
import { useParams } from 'react-router-dom';
import {
	FaAngleDown,
	FaAngleUp } from 'react-icons/fa';
import {
	Message,
	ChannelProps,
	ChannelDisplay as Display } from '../../Types';
import { useChat } from './ChatProvider';
import { useSocket } from './ChatSocketProvider';


const ChannelTitle = (props: ChannelProps) => {

	const handleToggleMenu = () => {
		props.state === Display.Screen ? props.setState(Display.Menu) : props.setState(Display.Screen)
	}

	return (
		<div className="channel-title-container">
			{props.name}
			{ props.state === Display.Screen ? 
			
			<FaAngleDown className="channel-menu-button" onClick={handleToggleMenu}></FaAngleDown>
			:
			<FaAngleUp onClick={handleToggleMenu}/>
			}
		</div>
	)
}

const ChannelScreen = (props: {messages: Message[]}) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const chat = useChat();
	const {socket} = useSocket();
	const {id} = useParams();

	useEffect(() => {
		setMessages([]);
	  }, [id]);

	useEffect(() => {
		if (messages.length === 0) {
			const oldMessages = [...props.messages, ...messages];
			setMessages(oldMessages);
		}
	  }, [props.messages]);

	useEffect(() => {
		const handleMessage = (message: any) => {
		  setMessages(prevMessages => [
			...prevMessages,
			{
			  id: message.id,
			  sender: message.user.username,
			  content: message.message_text
			}
		  ]);
		};
	
		if (socket) {
		  socket.on(`channel${id}`, handleMessage);
		}

		return () => {
			if (socket) {
				socket.off(`channel${id}`, handleMessage);
			}
		};
	  }, [id, socket]);


  useEffect(() => {
    const chatbox = document.getElementById("channel-screen-container");
	if (chatbox) {
		chatbox.scrollTop = chatbox.scrollHeight;
    }
  }, [chat.sentMsgs]);  

  return (
		<div className="channel-screen-container" id="channel-screen-container">
			{ messages.map((message) => (
			<li key={message.id} className="message">
				<strong key={message.id}>{message.sender}:</strong> {message.content}
			</li>
			)) }
		</div>
	);
}

const ChannelInput = () => {
	const [message, setMessage] = useState("")
	const {socket} = useSocket();
	const {id} = useParams();

	const handleSubmit = async (e : FormEvent) => {
		e.preventDefault()
		if (message.trim() === '')
			return;
		socket?.emit("message", {message: message, channel: id});
		setMessage("");
	};

	return (
		<form onSubmit={handleSubmit} className="channel-input-container" id="channel-input-container">
			<input
				type="text"
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				placeholder="Type your message..."
			/>
			<button type='submit'>Send</button>
		</form>
	);
}

export { ChannelTitle, ChannelScreen, ChannelInput};