import {
	useState,
	useEffect } from "react";
import {
	useNavigate,
	useParams } from "react-router-dom";

import axios from "../../axiosInstance";

const ChatNav = () => {

	return (
		<div className="chat-nav-container">
			<ChatList />
			<ChatSearchButton />
			<ChatNavNewButton />
		</div>
	)
}

export const ChatList = () => {
	const [channels, setChannels] = useState<{id: number, name: string}[]>([]);
	const params = useParams();
	const path = window.location.pathname;
	const [currentUrl, setCurrentUrl] = useState(path);

	useEffect(() => {
		setCurrentUrl(path);
	}, [path]);
	
	const fetchData = async () => {
		try {
			const res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/chat/channel/channel_list`);
			setChannels(res.data.channels);
		} catch (error) {}
	}

	useEffect(() => {
		fetchData()
	}, [currentUrl, params]);

	return (
		<ul className="chat-list">
			{channels.map((channel) => (
				<li key={channel.id}>
					<ChatListButton
						key={channel.id}
						id={channel.id}
						title={channel.name}
					/>
				</li>
			))}
		</ul>
	);
}

const ChatListButton = (props: {id: number, title: string}) => {

	const navigate = useNavigate();
	
	const handleChannelClick = () => {
		navigate(`/chat/${props.id}`);
	}

	return (
		<button onClick={() => {handleChannelClick()}}>
			{props.title}
		</button>
	)
}

const ChatNavNewButton = () => {

	const navigate = useNavigate();

	const handleClick = () => {
		navigate('/chat/create');
	}

	return (
		<button className="new-channel-button"
			onClick={() => {handleClick()}}>
				Create new channel
		</button>
	)
}

const ChatSearchButton = () => {

	const navigate = useNavigate();

	const handleClick = () => {
		navigate('/chat/search');
	}

	return (
		<button className="chat-search-button"
			onClick={handleClick}>
			search channels
		</button>
	)
}
export default ChatNav;
