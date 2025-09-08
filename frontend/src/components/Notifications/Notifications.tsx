import 'reactjs-popup/dist/index.css';
import '../../styling/Notifications.css';

import React, {
	ReactElement,
	useRef,
	useEffect,
	useState } from "react";
import Popup from "reactjs-popup";

import {
	MdOutlineNotificationsActive,
	MdNotificationsNone } from "react-icons/md";

import axios from '../../axiosInstance'
import { useNotification } from "./NotificationProvider";
import {
	NotificationType,
	NotificationProps } from "../../Types";

import { useLocation } from 'react-router-dom';

const deleteNotification = (id: number, notificationsRef: React.MutableRefObject<NotificationType[]>) : void => {

	notificationsRef.current = notificationsRef.current.filter(notif => notif.id !== id);
	return;
}

const ResponseNotification = (props: {notifRef: React.MutableRefObject<NotificationType[]>, notification: NotificationType, msg: string, setReload: React.Dispatch<React.SetStateAction<boolean>>}) => {

	const msg = `${props.notification.sender.username} ${props.msg}`;

	const handleClose = async () => {
	
		await axios.delete(`${process.env.REACT_APP_SERVER_URL}/notification/${props.notification.id}`)
		.catch(function (error) {
			console.log(error);
			deleteNotification(props.notification.id, props.notifRef);
		})
		deleteNotification(props.notification.id, props.notifRef);
		props.setReload(prev => !prev);
	}

	return (
		<div className="notif-response">
			{ msg } <br/>
			<button onClick={handleClose}>
				close
			</button>
		</div>
	)
}

const RequestNotification = (props: {notifRef: React.MutableRefObject<NotificationType[]>, notification: NotificationType, msg: string, setReload: React.Dispatch<React.SetStateAction<boolean>>}) => {

	const { socket , setReload} = useNotification();
	const msg = `${props.notification.sender.username} ${props.msg}`;

	const handleAccept = async () => {
		if (props.notification.feature === "friend") {
			socket?.emit("friend_request_accepted", {
				friendId: props.notification.sender.id,
				requestId: props.notification.type_id,
				notificationId: props.notification.id
			});
		}
		else if (props.notification.feature === "game") {
			try {
				await axios.post(`${process.env.REACT_APP_SERVER_URL}/challengematch`, {
						challengerID: props.notification.sender.id.toString(),
						level: props.notification.level
					});
				socket?.emit("game_invite_accepted", {
					challengerId: props.notification.sender.id,
					notificationId: props.notification.id
				});
				alert("Game on! Find your match in the game section")
			} catch (error: any) {
				console.log(error);
			}
		}
		deleteNotification(props.notification.id, props.notifRef);
		props.setReload(prev => !prev);
		await new Promise(r => setTimeout(r, 500));
		setReload(prev => !prev);
	}

	const handleDecline = async () => {
		if (props.notification.feature === "friend") {
			await axios.delete(`${process.env.REACT_APP_SERVER_URL}/friendrequest/${props.notification.type_id}`)
			.then(async function (response) {
				await axios.delete(`${process.env.REACT_APP_SERVER_URL}/notification/${props.notification.id}`)
			})
			.catch(function (error) {
				console.log(error);
			})
		}
		else if (props.notification.feature === "game") {
			try {
				await axios.delete(`${process.env.REACT_APP_SERVER_URL}/notification/${props.notification.id}`)
			} catch (error) {}
		}
		deleteNotification(props.notification.id, props.notifRef);
		props.setReload(prev => !prev);
	}

	return (
		<div className="notif-request">
			{ msg }
			<div className="notif-action-container">
				<button onClick={handleAccept}>accept</button>
				<button onClick={handleDecline}>decline</button>
			</div>
		</div>
	)
}

export const Notifications = () => {

	const { socket } = useNotification();
	const [unread, setUnread] = useState<boolean>(false);
	const [alert, setAlert] = useState(false);
	const firstRender = useRef(true);
	const notificationsRef = useRef<NotificationType[]>([]);

	const fetchData = async () => {
		await axios.get(`${process.env.REACT_APP_SERVER_URL}/notification`)
		.then(function (response) {
			firstRender.current = false;
			notificationsRef.current = response.data;
			if (response.data.length > 0)
				setUnread(true);
		})
		.catch(function (error) {
			console.log(error)
		})
	}

	useEffect(() => {
		if (firstRender.current === true)
			fetchData();
		if (alert) {
			const icon = document.getElementById("notifications-icon");
			if (icon)
				icon.classList.add('shake');
			icon.addEventListener('animationend', () => {icon.classList.remove('shake');}, {once: true})
			setAlert(false);
		}
	}, [unread, alert])

	useEffect(() => {
		const handleNotification = (notification: NotificationType) => {
			notificationsRef.current.push(notification);
			setAlert(true);
			setUnread(true);
		}

		if (socket) {
			socket.on('notification', handleNotification)
		}

		return () => {
			if (socket) {
				socket.off('notification', handleNotification)
			}
		};
	}, [socket])

	
	return (
		<div className="notification-icon">
			<NotificationModal
				buttonText={"notifications"}
				content={<NotificationList notificationsRef={notificationsRef} />}
				unread={unread}
				setUnread={setUnread}
				notificationsRef={notificationsRef}
			/>
		</div>
	)
}

export const NotificationList = (props: NotificationProps) => {

	const requestDescription = {
		"friend": ` sent you a friend request`,
		"game": ` invites you for a game`,
		"dm": ` wants to send you a private message`,
	};
	const responseDescription = {
		"friend": ` accepted your friend request!`,
		"game": ` has accepted your game invitation, find your match in the game section.`,
		"dm": `You are not supposed to be seeing this notification because we did not implement this`,
	};
	const message = (props.notificationsRef.current === null || props.notificationsRef.current.length === 0) ? "No new notifications" : "";
	const [reload, setReload] = useState(false);

	useEffect(() => {
		const notifList = document.getElementById("notification-list");
		if (notifList) {
			notifList.scrollTop = notifList.scrollHeight;
		}
	  });  

	return (
		<ul className="notification-list">
			{ message }
			{ props.notificationsRef.current.map((notif) => (
					<li key={notif.id}>
					{ notif.type === "request"
						?
							<RequestNotification
								notifRef={props.notificationsRef}
								notification={notif}
								msg={requestDescription[notif.feature]}
								setReload={setReload}
							/>
						:
							<ResponseNotification
								notifRef={props.notificationsRef}
								notification={notif}
								msg={responseDescription[notif.feature]}
								setReload={setReload}
						/>}
				</li>
			))}
		</ul>
	)
}
interface NotificationModalProps {
	buttonText: string;
	content: ReactElement;
	unread: boolean;
	setUnread: React.Dispatch<React.SetStateAction<boolean>>;
	notificationsRef: React.MutableRefObject<NotificationType[]>
}

const NotificationModal = (props: NotificationModalProps) => {

	const path = window.location.pathname;
	const iconStyle = props.unread ? {height: "2rem", width: "2rem" } : {height: "1.5rem", width: "1.5rem" };

	// const iconStyle = props.unread ? {color: "yellow", height: "1.5rem", width: "1.5rem" } : {height: "1.5rem", width: "1.5rem" };
	// const iconStyle = {height: "1.5rem", width: "1.5rem" };

	const [open, setOpen] = useState(false);
	const [currentUrl, setCurrentUrl] = useState(path);
	const location = useLocation();

	const closeModal = () => {
		setOpen(false);
		props.setUnread(false);
	}
	
	useEffect(() => {
		if (location.pathname !== currentUrl)
			setOpen(false);
	}, [location])

	useEffect(() => {
		if (path !== currentUrl)
			setOpen(false);
		return () => {
			setOpen(false);
		}
	}, []);

	return (
		<div className="modal-container">
			<div className="notifications-icon" id="notifications-icon">
				{ ( props.unread === true ? 
				<MdOutlineNotificationsActive style={iconStyle} onClick={() => setOpen(o => !o)}/>
				:
				<MdNotificationsNone style={iconStyle} onClick={() => setOpen(o => !o)}/>)
				}
			</div>
		<Popup open={open} closeOnDocumentClick onClose={closeModal}
			position="top right"
	
			modal>
				<span> {props.content} </span> 
		</Popup>
	</div>
	)
}
