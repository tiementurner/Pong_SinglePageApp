import {
	NavLink,
	useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../Authenticate/AuthProvider';
	
export const Logout = () => {

	const {logout} = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		logout(() => navigate('/login', { replace:true }))
	}, [])
	
	return <></>;
}

export const TopNavLayout = () => {

	return (
		<nav>
			<NavLink to="/">home</NavLink>
			<NavLink to="chat">chat</NavLink>
			<NavLink to="game">game</NavLink>
			<NavLink to="profile">profile</NavLink>
			<NavLink to="logout">logout</NavLink>
		</nav>
	)
};
