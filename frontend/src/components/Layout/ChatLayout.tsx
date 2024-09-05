import {
	useEffect,
	useState
} from 'react';
import {
	Outlet,
	Link,
	useNavigate,
	useParams
} from 'react-router-dom';

import {
	Message,
	ChannelDisplay as Display } from '../../Types';
import ChatProvider from '../Chat/ChatProvider';
import ChatNav from '../Chat/ChatNav';
import ChannelMenuLayout from '../Layout/ChannelMenuLayout';
import axios from '../../axiosInstance';
import {
	ChannelTitle,
	ChannelInput,
	ChannelScreen
} from '../Chat/ChannelComponents';

const ChatLayout = () => {

	return (
		<div className="chat-container" id="chat-container">
			<ChatProvider>
				<ChatNav />
				<Outlet />
			</ChatProvider>
		</div>
	)
}

const ChannelPlaceholder = () => {
	return (
		<div className="channel-container">
			<p className="channel-placeholder">
				Find a channel to join using the <Link to='search'>search bar</Link>
			</p>
			<p className="channel-placeholder">
				<Link to='/chat/create'>create</Link> a channel
			</p>
			<div className="tiemen-container"/>
		</div>
	)
}

//hier pak ik de characters achter de slash en check of het wel een nummer is.
//probleem: route chat/dklasds crasht

export const getIdFromURL = () => {
	var url = window.location.href;
	var matchResult = url.match(/[^\/]+$/);
	if (matchResult !== null) {
		var id = matchResult[0];
		if (!isNaN(Number(id))) {
			return id;
		} else {
			return null;//moet iets doen als er rubbish is ingevuld in url
		}
	} else {
		return null;//als matchresult op een een of andere manier null is iets doen
	}
}

export const ChannelLayout = () => {

	const [channelState, setChannelState] = useState(Display.Screen);
	const [messages, setMessages] = useState<Message[]>([]);
	const [channelName, setChannelName] = useState('');
	const navigate = useNavigate();
	const {id} = useParams();
	
	useEffect(() => {
		const getChannelMessages = async () => {
			const channelId = getIdFromURL();
			
			try {
				const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/chat/${channelId}/messages`);
				const transformedMessages = response.data.map((message:any) => ({
					id: message.message_id,
					sender: message.user.username,
					content: message.message_text
				}))
				setMessages(transformedMessages);
			} catch (error: any) {
				navigate('/chat');
			}
		}
	
		getChannelMessages()
	}, [id, channelState])

	useEffect (() => {
		const getChannelName = async () => {
			const channelId = getIdFromURL();
			try {
				const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/chat/channel/${channelId}/getname`);
				setChannelName(response.data);
			} catch (error: any) {
				navigate('/chat');
			}
		}
		getChannelName();
	}, [id])

	return (
		<div className="channel-container">
			<ChannelTitle name={channelName} state={channelState} setState={setChannelState}/>
			{channelState === Display.Screen ?
				<>
					<ChannelScreen messages={messages} />
					<ChannelInput />
				</>
				:
					<ChannelMenuLayout/> }
		 </div>
	);
}

const NewChannelSuccessLayout = () => {
	return (
		<div className="channel-container"> 
			<p>
				Channel succesfully created
			</p>
		</div>
	)
}

export default ChatLayout;
export { ChannelPlaceholder, NewChannelSuccessLayout };