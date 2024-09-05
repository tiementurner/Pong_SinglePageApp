import {
	FormEvent,
	useRef,
	useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "../../axiosInstance";
import { CreateChannelMask as Mask } from "../../Types";

export const NewChannel = () => {

	const navigate = useNavigate();
	const [validate, setValidate] = useState(0);
	const [name, setName] = useState("");
	const [isPrivate, setIsPrivate] = useState(false);
	const [password, setPassword] = useState("");

	const handleType = (selection: string) => {
		setIsPrivate((selection === "public" ? false : true));
		if (isPrivate === false)
			setPassword("");
	}

	let validateRef = useRef(Mask.Valid);

	type FindName = (name: string) => Promise<void>

	const findName: FindName = async (name) => {
		try {
			const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/chat/channel/exists`, {
				params: {
					name: name
				}});
			if (response.data === false)
				validateRef.current &= ~Mask.DuplicateName;
			else
				validateRef.current |= Mask.DuplicateName;
		} catch (error: any) {
			console.log(error.response.data.message)
			validateRef.current |= Mask.ServerError;
		}
	}

	const validateSettings = async () => {
		if ( name === "" )
			validateRef.current |= Mask.NoName;
		else
		{
			validateRef.current &= ~Mask.NoName;
			await findName( name );
		}
		if ( isPrivate === true && password === "")
			validateRef.current |= Mask.NoPassword;
		else
			validateRef.current &= ~Mask.NoPassword;
	}

	const addToDatabase = async () => {
		try {
			await axios.post(`${process.env.REACT_APP_SERVER_URL}/chat/channel/create`, {
				name: name,
				isPrivate: isPrivate,
				password: password,
				isDM: false
			})
		} catch (error: any) {
			console.log(error.response.data.message)
			validateRef.current |= Mask.ServerError;
		}
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		await validateSettings();
		if (validateRef.current === Mask.Valid)
		{
			await addToDatabase();
			navigate(`/chat/success`, {replace: true});
		}
		setValidate(validateRef.current);
	}

	return (
		<div className="channel-container">
		<form onSubmit={handleSubmit} className="new-channel-form">
			{ ( validateRef.current & Mask.NoName ) ? <NewChannelError msg="name is required"/> : <></> }
			{ ( validateRef.current & Mask.DuplicateName ) ? <NewChannelError msg="name already in use"/> : <></>}
			<label htmlFor="new-channel-name"> New channel name:</label>
			<input id="new-channel-name"
				type="text"
				value={ name }
				name="new-channel-name"
				onChange={( e ) => setName(e.target.value)} />
			<fieldset id="new-channel-type">
			<label htmlFor="channelTypeChoicePublic">public</label>
			<input
				type="radio"
				name="new-channel-type"
				id="channelTypeChoicePublic"
				value="public"
				onChange={(e) => handleType(e.target.value)}
				defaultChecked/>
			<label htmlFor="channelTypeChoicePrivate">private</label>
			<input
				type="radio"
				name="new-channel-type"
				id="channelTypeChoicePrivate"
				value="private"
				onChange={(e) => handleType(e.target.value)} />
			</fieldset>
			{ ( validateRef.current & Mask.NoPassword )  ? <NewChannelError msg="password is required" /> : ""}
			{ isPrivate === true ?
				<>
				<label htmlFor="new-channel-password">Set password</label>
				<input id="new-channel-password"
				type="password"
				value={ password }
				onChange={( e ) => setPassword(e.target.value)} /> </>: <></>}
				<input type="submit" value="submit"/>
		</form>
		</div>

	)
}

const NewChannelError = (props: {msg: string}) => {

	return (
		<div className="new-channel-input-container">
			<div className="new-channel-error-msg">
				{ props.msg }	
			</div>
		</div>
	)
}

export default NewChannel
