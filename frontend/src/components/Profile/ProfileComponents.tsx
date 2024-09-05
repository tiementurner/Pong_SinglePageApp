import {
	useEffect,
	useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../axiosInstance";
import { BsPersonPlus } from 'react-icons/bs'

import { useNotification } from "../Notifications/NotificationProvider";
import { useStatusContext } from "../Status/Status";

const ProfileAvatar = (props: {avatar: string, userId: number, profileId: number}) => {

	const navigate = useNavigate();

	const handleClick = () => {
		if (props.profileId !== props.userId)
			return ;
		navigate(`/account`);
	}

	return (
		<div className="profile-avatar">
			<img onClick={handleClick}
				src={`${process.env.REACT_APP_SERVER_URL}/avatar/${props.avatar}?${Date.now()}`}
				alt={"user avatar"}
			/>
		</div>
	);
}

export const ProfileAdd = (props: {profileId: number}) => {

	const {socket} = useNotification();

	const handleClick = () => {
		socket?.emit("friend_request", {receiverId: props.profileId});
		alert("Friend request sent!")
	}

	return (
		<button onClick={handleClick} className="profile-add">
			<BsPersonPlus
				className="profile-add"
				title="add as friend"
				onClick={handleClick}/>
		</button>
	);
}

const ProfileName = (props: {name: string}) => { 

	return (
		<div className="profile-name">
			{ props.name }
		</div>
	);
}

const ProfileStatus = (props: {profileId: number}) => {

	const [status, setStatus] = useState<string>("");
	const stringID = props.profileId.toString();
	const { socket } = useStatusContext();

	useEffect(() => {
        if (!socket) return;

        const intervalID = setInterval(() => {
            socket.emit("get_friend_status", { friendID:stringID });
        }, 1000);

        socket.on(`friend_status${stringID}`, data => {
            setStatus(data);
        });

        return () => {
            clearInterval(intervalID);
            socket.off(`friend_status${stringID}`);
        };
    }, [socket, stringID]);

	return (
		<div className="profile-status">
			{ status }
		</div>
	)
}

const ProfileInvite = (props: {profileId: number}) => {
	const {socket} = useNotification();
	const [chooseLevel, setChooseLevel] = useState<boolean>(false);

	const handleClick = () => {
		setChooseLevel(true);
	}

	const handleEasy = () => {
		socket?.emit("invite_for_game", {receiverId: props.profileId, level: 1});
		alert("Game invite sent!")
		setChooseLevel(false);
	}
	const handleHard = () => {
		socket?.emit("invite_for_game", {receiverId: props.profileId, level: 2});
		alert("Game invite sent!")
		setChooseLevel(false);
	}

	if (chooseLevel === false) {
		return (
			<button className="profile-button" onClick={handleClick}>
				invite for match
			</button>
		)
	} else {
		return (
			<div>
				<button className="profile-button" onClick={handleEasy} style={{width: "50px"}}>
					Easy
				</button>
				<button className="profile-button" onClick={handleHard}style={{width: "50px"}}>
					Hard
				</button>
			</div>
		)
	}
}

const ProfileSendDM = (props: {profileId: number}) => {

	const navigate = useNavigate();

	const handleClick = async () => {
		try {
			const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/chat/channel/createDM/${props.profileId}`);
			navigate(`/chat/${response.data.id}`)
		} catch (error: any) {
			console.log(error.response.data.message)
		}
	}

	return (
		<button className="profile-button" onClick={handleClick}>
			Send DM
		</button>
	)
}

export {ProfileAvatar, ProfileName, ProfileStatus, ProfileInvite, ProfileSendDM};
