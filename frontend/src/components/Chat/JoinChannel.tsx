import {
	FormEvent,
	useState,
	useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../axiosInstance";

//! Op dit moment geen onderscheid tussen channel waar user al lid van is of niet.
//! Krijgt te zien 'succesfully joined channel' alsof je er eerst nog geen lid van was
export const PublicJoin = (props: {channelId: number}) => {

	const [success, setSuccess] = useState(false);
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		const postData = async () => {
			try {
				const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/chat/channel/${props.channelId}/join`, {})
				navigate(`/chat/${response.data.id}`);
				setSuccess(true);
			} catch (error: any) {
				setErrorMessage(error.response.data.message);
			}
		}
		postData();
	}, [])

	return (
		<div>
			{errorMessage ? (
				<div>{errorMessage}</div>
			) : (
				<div>
					{success === false ? "Joining channel..." : "Successfully joined channel"}
				</div>
			)}
		</div>
	)
}

export const PrivateJoin = (props: {channelId: number}) => {
	const [password, setPassword] = useState("");
	const [success, setSuccess] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		try {
			const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/chat/channel/${props.channelId}/join`, {
				password : (password)
			})
			navigate(`/chat/${response.data.id}`);
			setSuccess(true);
		} catch (error: any) {
			setErrorMessage(error.response.data.message);
		}
	}

	return (
		<div>
			{errorMessage ? (
				<div>{errorMessage}</div>
			) : (
				<div>
					{ success === false ?
						<form onSubmit={handleSubmit}>
						<input
							type="password"
							placeholder="Enter password"
							onChange={(e) => {setPassword(e.target.value)}}>
							</input>
						</form>
					:		
					"channel joined successfully!" }
				</div>
			)}
		</div>
	)
}