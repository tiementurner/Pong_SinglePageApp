import '../../styling/Account.css';
import '../../styling/App.css';
import '../../styling/Auth.css';
import '../../styling/index.css'

/** Chat stylesheets */
import '../../styling/ChannelMenu.css';
import '../../styling/Chat.css';

/** Profile stylesheets */
import '../../styling/Friends.css';
import '../../styling/ProfileComponents.css';
import '../../styling/StatsHistory.css';

/** React components */
import React, {
	useEffect,
	useState
} from 'react';
import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
	RouterProvider,
	useNavigate,
	useLocation,
	Outlet
} from "react-router-dom";

import Home from '../Home';
/** Navigation & access components */
import {
	AuthProvider,
	useAuth,
	RequireAuth,
	LoginSuccess, 
	TwoFactorAuth,
	Register
} from '../Authenticate/AuthProvider';
import {
	TopNavLayout,
	Logout
} from './NavLayout'
import Error from '../Error/ErrorPage'
/** Chat components */
import ChatLayout, {
	ChannelPlaceholder,
	ChannelLayout,
	NewChannelSuccessLayout
} from './ChatLayout';
import { Search as ChatSearch } from '../Chat/Search';
import { NewChannel } from '../Chat/NewChannel';
import { ChatSocketProvider } from '../Chat/ChatSocketProvider';
/** Game components */
import Game from '../Game/Game';
import PrivateGame from '../PrivateGame/PrivateGame'
import { RoomInterface } from '../Game/RoomInterface';
import { Pong } from '../Game/Pong';
/** Account and profile components */
import AccountLayout from '../Account/AccountComponents';
import ProfileLayout, {
	ProfilePlaceholder,
	Profile
} from './ProfileLayout';
import { Search as FriendSearch } from '../Friends/Search';
/** Notification & status components */
import { NotificationSocketProvider } from '../Notifications/NotificationProvider';
import { Notifications } from '../Notifications/Notifications';
import { MyStatusProvider } from '../Status/Status';
import axios from '../../axiosInstance'

export const LoginPage = ( ) => {
	const [serverError, setServerError] = useState("");
	const auth = useAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		username: '',
		password: ''
	  });
	
  	const from = location.state?.from?.pathname || "/";

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			await axios.post(`${process.env.REACT_APP_SERVER_URL}/auth/login`, {
				userName: formData.username,
				password: formData.password
			});
			auth.login(() =>  navigate(from, { replace: true}))
		} catch (error) {
			console.log(error.response);
			setServerError(error.response.data.message);
		}
	};

	useEffect(() => {
		if (auth.authenticated === true)
			navigate('/');
	}, [])

	return (
		<div>
			<p> Authentication is required to access this page </p>
			<div>
				<form onSubmit={handleSubmit}>
					<div>
					<label htmlFor="username">Username:</label>
					<input
						type="text"
						id="username"
						name="username"
						value={formData.username}
						onChange={handleChange}
						required
					/>
					</div>
					<div>
					<label htmlFor="password">Password:</label>
					<input
						type="password"
						id="password"
						name="password"
						value={formData.password}
						onChange={handleChange}
						required
					/>
					</div>
					<button type="submit">Login</button>
				</form>
				<div><p>{serverError}</p></div>
			</div>

			<div>
				<button onClick={() => {
					auth.login42(() =>  navigate(from, { replace: true}));
					}}>Authenticate with 42</button>
			</div>
			<div>
				<button onClick={() => {navigate('/register') }}>Register</button>
			</div>
		</div>
	)
};

export const RootLayout = () => {

	const { authenticated } = useAuth();
	
	if (window.location.pathname === '/TwoFactorAuth')
		return (
			<div className="app-container">
			<div className="page-container">
				<Outlet /> 
			</div>
			{ authenticated === true && <Notifications /> }
	</div>);

	return (
	<div className="app-container">
		<TopNavLayout/>
		<div className="page-container">
				<Outlet /> 
		</div>
		{ authenticated === true && <Notifications /> }
	</div>
	);
};

/**
 * 
 * Tutorial used for setting up browserRouter:
 * https://www.youtube.com/watch?v=5s57C7leXc4&list=PL4cUxeGkcC9iVKmtNuCeIswnQ97in2GGf&index=3
 * 
 */

const Router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={ <RootLayout />} errorElement={ <Error />}>
			<Route index element={
				<RequireAuth> 
					<Home /> 
				</RequireAuth>}/>
			<Route path="login"
				element={<LoginPage />} />
			<Route path="register"
				element={<Register/>} />
			<Route path="loginSuccess"
				element={<LoginSuccess />}/>
			<Route path="TwoFactorAuth"
				element={<TwoFactorAuth />}/>
				<Route path="chat"
					element={
						<RequireAuth>
							<ChatSocketProvider>
								<ChatLayout/>
							</ChatSocketProvider>
						</RequireAuth> }>
					<Route
						index
						element={ <ChannelPlaceholder />} />
					<Route path=":id"
						element= { <ChannelLayout /> } />
					<Route path="create"
						element={ <NewChannel /> } />
					<Route path="success"
						element={ <NewChannelSuccessLayout /> } />
					<Route path="search"
						element={ <ChatSearch /> } />
				</Route>
				<Route path="game"
					element={
						<RequireAuth>
							<Game />
						</RequireAuth>}> 
					<Route
						index
						element= {<RoomInterface />} />
					<Route path="pong/:roomnbr"
						element={<Pong />} />
					<Route path="private_game"
						element={<PrivateGame />} />
				</Route>
				<Route path="account"
					element={
						<RequireAuth>
							<AccountLayout />
						</RequireAuth>}/>
				<Route path="profile"
					element={
					<RequireAuth>
						<ProfileLayout />
					</RequireAuth>}>
						<Route index element={<ProfilePlaceholder/>}/>
						<Route path=":id"
							element={<Profile />}/>
				</Route>
					<Route path="search"
						element={
							<RequireAuth>
								<FriendSearch/>
							</RequireAuth>
						}/>
			<Route path="logout" element={
				<RequireAuth>
					<Logout />
				</RequireAuth>}/>
			<Route path="error" element={<Error/>} />
			<Route path="*" element={<Error/>}/>
		</Route>
	)

)

export const App = () => {

	return (
		<AuthProvider>
			<NotificationSocketProvider>
				<MyStatusProvider>
					<RouterProvider router={Router}/>
				</MyStatusProvider>
			</NotificationSocketProvider>
		</AuthProvider>
	)
}
