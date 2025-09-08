import {
	useState,
	FormEvent } from "react";
import {
	useNavigate,
	useParams } from "react-router-dom";
import axios from "../../axiosInstance";
import { useMember } from "../Layout/ChannelMenuLayout";
import { useNotification } from "../Notifications/NotificationProvider";

const MemberName = (props: {username: string}) => {
	
	const { member } = useMember();

	const navigate = useNavigate();

	const handleClick = () => {
		navigate(`/profile/${member.id}`)
	}
	return (
		<div onClick={handleClick} className="channel-menu-member-name">
			{ props.username }
		</div>
	)
}


const MemberBlock = (props: {setReload: any}) => {
	const {member} = useMember();

	const handleBlock = async () => {
		try {
			await axios.post(`${process.env.REACT_APP_SERVER_URL}/chat/block/${member.id}`);
			props.setReload();
		} catch(error: any){}
	}

	return (
		<div className="channel-menu-member-block">
			<button
			onClick={() => handleBlock()}>
				block
			</button>
		</div>
	)
}

const MemberunBlock = (props: {setReload: any}) => {
	const {member} = useMember();

	const handleunBlock = async () => {
		try {
			await axios.post(`${process.env.REACT_APP_SERVER_URL}/chat/unblock/${member.id}`);
			props.setReload(false);
		} catch (error : any) {}
	}

	return (
		<div className="channel-menu-member-unblock">
			<button
			onClick={() => handleunBlock()}>
				unblock
			</button>
		</div>
	)
}

const MemberInviteMatch = () => {
	const {member} = useMember();
	const {socket} = useNotification()

 	const handleInvite = () => {
		socket?.emit('invite_for_game', {receiverId: member.id});
		alert(`You have invited ${member.username} for a game of pong.`);
	}

	return (
		<div className="channel-menu-member-invite-match">
			<button
			onClick={() => handleInvite()}>
				invite
			</button>
		</div>
	)
}
//testen
const MemberMute = () => {
	const {member} = useMember();
	const {id} = useParams();

	const handleMute = async () => {
		try {
			await axios.post(`${process.env.REACT_APP_SERVER_URL}/chat/channel/${id}/mute/${member.id}`);
			//console.log(response.data);
		} catch (error : any) {}
	}

	return (
		<div className="channel-menu-member-mute">
			<button
			onClick={() => handleMute()}>
				mute
			</button>
		</div>
	)
}

const MemberKick = (props: {setReload: any}) => {
	const {member} = useMember();
	const {id} = useParams();

	const handleKick = async () => {
		try {
			const response = await axios.delete(`${process.env.REACT_APP_SERVER_URL}/chat/channel/${id}/kick/${member.id}`);
			console.log(response.data);
			props.setReload();
		} catch (error : any) {}
	}

	return (
		<div className="channel-menu-member-kick">
			<button
			onClick={() => handleKick()}>
				kick
			</button>
		</div>
	)
}

//deze moet nog getest worden zodra je channel kan joinen om te kijken of user
//wel echt gebanned is.
const MemberBan = (props: {setReload: any}) => {
	const {member} = useMember();
	const {id} = useParams();

	const handleBan = async () => {
		try {
			const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/chat/channel/${id}/ban/${member.id}`);
			console.log(response.data);
			props.setReload();
		} catch (error : any) {}
	}
	return (
		<div className="channel-menu-member-ban">
			<button
			onClick={() => handleBan()}>
				ban
			</button>
		</div>
	)
}

const LeaveChannel = () => {
	const {id} = useParams();
	const navigate = useNavigate();

	const handleLeaveChannel = async () => {
		try {
			await axios.delete(`${process.env.REACT_APP_SERVER_URL}/chat/channel/${id}/leave`);
			//console.log(response.data);
			navigate('/chat');
		} catch (error: any) {}
	}

	return (
		<div className="channel-menu-leave-channel">
			<button
			onClick={() => handleLeaveChannel()}>
				Leave channel
			</button>
		</div>
	)
}

const SetAdmin = (props: {setReload: React.Dispatch<React.SetStateAction<boolean>>}) => {
	const {member} = useMember();
	const {id} = useParams();

	const handleSetAdmin = async () => {
		try {
			const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/chat/channel/${id}/admin/${member.id}`);
			console.log(response.data);
			props.setReload(prev => !prev);
		} catch (error : any) {}
	}
	return (
		<div className="channel-menu-make-admin">
			<button
			onClick={() => handleSetAdmin()}>
				make admin
			</button>
		</div>
	)
}


const PasswordForm = (props: {setReload: React.Dispatch<React.SetStateAction<boolean>>, route: string, successMsg: string, elementId: string}) => {
	const [input, setInput] = useState('');
	const { id } = useParams();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		try {
			await axios.post(`${process.env.REACT_APP_SERVER_URL}/chat/channel/${id}/${props.route}`, {
				password: input
			});
			alert(props.successMsg)
			props.setReload(prev => !prev);
		} catch (error: any) {
			alert(error.response.data.message)
			setInput('')
		}
	}

	return (
		<form id={props.elementId} onSubmit={handleSubmit}>
			<input
				type="text"
				placeholder="enter new password"
				onChange={(e) => setInput(e.target.value)}>
			</input>
			<button onClick={handleSubmit}>
				Submit
			</button>
		</form>
	)
}

const ChangePassword = (props: {setReload: React.Dispatch<React.SetStateAction<boolean>>}) => {

	const [active, setActive] = useState(false);

	return (
		<div className="change-password">
			{
				active === false ?
					<button onClick={() => setActive(true)}>
						Change password
					</button>
				:
					<PasswordForm setReload={props.setReload} route='changePassword' successMsg='password succesfully changed' elementId="change-password-form"/>
			}
		</div>
	)
}

const RemovePasswordConfirmation = (props: {setReload: React.Dispatch<React.SetStateAction<boolean>>}) => {
	
	const {id} = useParams();

	const handleClick = async (value: string) => {
		if (value === 'yes') {
			try {
				await axios.delete(`${process.env.REACT_APP_SERVER_URL}/chat/channel/${id}/removePassword`)
				alert('password protection removed')
			} catch (error: any) {
				alert(error.response.data.message)
			}
		}
		props.setReload(prev => !prev);
	}

	return (
		<div>
			<form>
				<label htmlFor="remove-password-confirm">Are you sure you want to remove password protection for this channel? </label>
				<label htmlFor="remove-password-confirm-NO">No</label>
				<input
					type="radio"
					name="remove-password-confirm"
					id="remove-password-confirm-NO"
					value="no"
					onChange={ (e) => handleClick(e.target.value)}
				/>
				<label htmlFor="remove-password-confirm-YES">Yes</label>
				<input
					type="radio"
					name="remove-password-confirm"
					id="remove-password-confirm-YES"
					value="yes"
					onChange={ (e) => handleClick(e.target.value)}
				/>
			</form>
		</div>
	)
}

const RemovePassword = (props: {setReload: React.Dispatch<React.SetStateAction<boolean>>}) => {

	const [active, setActive] = useState(false);

	return (
		<div className="remove-password">
			{
				active === false
				?
				<button onClick={() => setActive(true)}>Remove password</button>
				:
				<RemovePasswordConfirmation setReload={props.setReload} />

			}
		</div>
	)
}

export const AddPassword = (props: {setReload: React.Dispatch<React.SetStateAction<boolean>>}) => {

	const [active, setActive] = useState(false);

	return (
		<div className="add-password">
			{
				active === false
				?
				<button onClick={() => setActive(true)}>Add password protection to channel</button>
				:
				<PasswordForm setReload={props.setReload} route='addPassword' successMsg='Password successfully added' elementId="add-password-form"/>
			}
		</div>
	)
}

export const ChannelSettings = (props: {setReload: React.Dispatch<React.SetStateAction<boolean>>, isPrivate: boolean, isDM: boolean}) => {

	if (props.isDM)
		return (null);
	if (!props.isPrivate)
		return (
			<div className="channel-menu-settings">
				<AddPassword setReload={props.setReload} />
			</div>
		);
	return (
		<div className="channel-menu-settings">
			<ChangePassword setReload={props.setReload}/>
			<RemovePassword setReload={props.setReload}/>
		</div>
	)
}
export { MemberName, MemberunBlock, MemberBlock, MemberInviteMatch, MemberMute, MemberKick, MemberBan, LeaveChannel, SetAdmin };