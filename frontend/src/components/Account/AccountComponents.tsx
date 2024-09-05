import React, {
	useState,
	useEffect, 
	FormEvent } from 'react';
import { useAuth } from '../Authenticate/AuthProvider';
import { AccountType } from '../../Types';
import axios from "../../axiosInstance";

const AccountLayout = () => {

	const { userId } = useAuth();
	const [reload, setReload] = useState(false);
	const [data, setData] = useState<AccountType>({username: '', image: '', is2FAenabled: false});
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			const res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/users/account`);
			setData(res.data);
			setLoading(false);
		};
		fetchData();
	}, [userId, reload])

	if (loading) return <div>Loading...</div>;


	return (
		<div className="account-container">
			<AccountInfoLayout
				username={data.username}
				image={data.image}/>
			{ data.is2FAenabled ?
				<AccountDisableTwoFA />
				:
				<AccountEnableTwoFA />
			}
			<AccountChangeUsername
				setReload={setReload}
				userId={userId}/>
			<AccountChangeAvatar
				setReload={setReload}
				userId={userId}/>
			<div className="naomi-container"/>
		</div>
	)
}

const AccountInfoLayout = (data: {username: string, image: string}) => {

	return (
		<div className="account-info-container">
			<div className="account-info-avatar">
				<img src={`${process.env.REACT_APP_SERVER_URL}/avatar/${data.image}?${Date.now()}`} alt={"user avatar"}/>
			</div>
			<div className="account-info-username">
				Welcome to your account page, <strong> {data.username} </strong> 
			</div>
		</div>
	)
}

const AccountDisableTwoFA = () => {

	const [success, setSuccess] = useState(false);

	async function disable2Fa(){
		try {
			await axios.post(`${process.env.REACT_APP_SERVER_URL}/TwoFactorAuth/disable2Fa`);
			setSuccess(true);
			console.log("2Fa disabled");
		} catch (error) {}
	}

	return (
		<div className="account-twofa" id="account-twofa-disable" onClick={disable2Fa}>
			Disable two factor authentication<br/>
			{ success ? "2fa succesfully disabled!" : ""}
		</div>
	);
};

const AccountEnableTwoFA = () => {
	const [QrPopup, setQrPopup] = useState(false);
	const [verificationCode, setVerificationCode] = useState("");
	const [protectionPopup, setProtectionPopup] = useState(false);
	const [succesPopup, setsuccesPopup] = useState(false);
	const [wrongCode, setWrongCode] = useState(false);

	async function enableordisable2Fa() {
		if (!QrPopup && !protectionPopup) {
			setsuccesPopup(false);
			try {
				const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/TwoFactorAuth/check2FA`);
				if (response.data === false)
					setProtectionPopup(true);
			} catch (error) {}
		}
	};


	const handleVerificationCodeChange = (event: any) => {
		setVerificationCode(event.target.value);
	};

	// Send the verification code to the backend
	async function submitVerificationCode (event: FormEvent){
		event.preventDefault();
		try {
			await axios.post(`${process.env.REACT_APP_SERVER_URL}/TwoFactorAuth/verify2FA`, { code: verificationCode });
			console.log("Verification code submitted:", verificationCode);
			setQrPopup(false);
			if (wrongCode === true)
				setWrongCode(false);
			setsuccesPopup(true);
		} catch (error){
			setWrongCode(true);
		}
	};

	async function continueAfterProtection() {
		setQrPopup(true);
		setProtectionPopup(false);
	};

	return (
		<div className="account-twofa" id="account-twofa-disable" onClick={enableordisable2Fa}>
			Enable two factor authentication
			{ succesPopup && (
				<div>
					<p>Succesfully enabled 2 Factor authentication for your account</p>
				</div> )
			}

			{ protectionPopup && (
				<div className="protection-popup">
					<p>Be sure nobody is watching, this QR is only meant for you!</p>
					<button onClick={continueAfterProtection}>Continue</button>
				</div> )
			}

			{ QrPopup && !protectionPopup && (
				<div>
					<img src={`${process.env.REACT_APP_SERVER_URL}/TwoFactorAuth/generate2FA`} alt="QrCode" />
					<form onSubmit={submitVerificationCode}>
						<input
							type="text"
							placeholder="Enter 6-digit code"
							value={verificationCode}
							onChange={handleVerificationCodeChange}
						/>
						<button onClick={submitVerificationCode}>Submit</button>
					</form>
				</div> )
			}

			{ wrongCode && (
				<p>Invalid authentication code! try again.</p> )
			}
		</div>
	);
};

const AccountChangeAvatar = (props: {setReload: React.Dispatch<React.SetStateAction<boolean>>, userId: number}) => {

	const [file, setFile] = useState<File | undefined>();

	const handleSubmit = async (event: any) => {
		event.preventDefault();

		if (typeof file === 'undefined') {
			alert("you can't submit nothing");
			return;
		}

		const formData = new FormData();

		formData.append('file', file);
		await axios.post(`${process.env.REACT_APP_SERVER_URL}/avatar/${props.userId}`, formData)
		.then(response => {
			props.setReload(prev => !prev);
		})
		.catch(error => {
			alert(error.response.data.message);
		})
	};

	const handleOnChange = (event: React.FormEvent<HTMLInputElement>) => {
		const target = event.target as HTMLInputElement & {
			files: FileList;
		}
		setFile(target.files[0]);
	};

	return (
		<form className="account-change-avatar" id="account-change-avatar" onSubmit={handleSubmit}>
			<label htmlFor='imageInput'>
				Change avatar:
			</label>
			<input type="file" name="imageInput" accept="image/png, image/jpg, image/jpeg" onChange={handleOnChange}/>
			<button type="submit">Submit</button>
		</form>
	)
}


const AccountChangeUsername = (props: {setReload: React.Dispatch<React.SetStateAction<boolean>>, userId: number}) => {

	const [username, setNewName] = useState('');

	const handleSubmit = async (e: FormEvent) => {

		e.preventDefault();
		if (username.trim() === '') {
			alert("You can't change your username into nothing");
			return ;
		}
		try {
			await axios.patch(`${process.env.REACT_APP_SERVER_URL}/users`, {
				username: username
			});
			alert("username changed!");
			props.setReload(prev => !prev);
			setNewName('');
		} catch (error:any) {
			alert(error.response.data.message);
		}
	};

	return (
		<form className="account-change-username" id="account-change-username" onSubmit={handleSubmit} >
			<label htmlFor='nameInput'>
				Change username:
			</label>
			<input
				name="nameInput"
				value={username}
				onChange={e => setNewName(e.target.value)} />
			<button onClick={handleSubmit}>
				Submit
			</button>
		</form>
	);
}

export default AccountLayout;
