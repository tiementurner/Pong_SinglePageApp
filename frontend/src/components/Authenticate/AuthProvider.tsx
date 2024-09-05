import React, {
	useState,
	useContext,
	createContext,
	useRef,
	useEffect } from "react";
import {
	useLocation,
	Navigate } from "react-router-dom";
import AuthCode, {
	AuthCodeRef } from 'react-auth-code-input';
			
import axios from "../../axiosInstance";
import { AuthContextType } from "../../Types";

axios.defaults.withCredentials = true;
/**
 * ABOUT THIS COMPONENT
 * Example used to set up the authentication router: https://github.com/remix-run/react-router/tree/dev/examples/auth-router-provider
 * This example is an official part of the React Router reference material.
 */

const AuthContext = createContext<AuthContextType>({
	userId: 0,
	authenticated: false,
	login42: () => void 0,
	logout: () => void 0,
	loginTestUser: () => void 0,
	loginTestUser2: () => void 0,
	login: () => void 0
});

// define the Authentication Provider. It receives as props 'children', which are of type ReactNode.
export const AuthProvider = ({ children } : { children: React.ReactNode }) => {

	// const navigate = useNavigate();
	const [userId, setUserId] = useState(0); //! i het mogelijk dat iemand ooit echt een user-id van 0 heeft? zo ja betyer veranderen naar -1 misschine
	const [authenticated, setAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);

	//Function for centering the popupwindow, don't know if this is the right place to define it.
	function popupwindow(url: string, title: string, w: number, h:number) {
		var left = (window.screen.width/2)-(w/2);
		var top = (window.screen.height/2)-(h/2);
		return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
	}

	const login:AuthContextType["login"] = async (redirect) => {
		try {
			const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/auth/authenticate`);	
			setUserId(response.data.id);
			setAuthenticated(true);
			redirect();
		} catch (error : any) {
			//console.log(error.response.data);
			logout(() => redirect);
		}
	}

	const login42:AuthContextType["login42"] = (redirect) => {
		//Open popup that starts the oauth2 flow
		const Popup = popupwindow(`${process.env.REACT_APP_SERVER_URL}/auth/login42`, 'Authentication', 500, 600);
		//Set a timerfunction that checks every 500 microseconds(?) if the popupwindow is closed.
		const timer = setInterval(async() => {
			if (Popup?.closed) {
				clearInterval(timer);
				//Session is now stored in database.
				//Make request to backend to see if authentication was succesful
				try {
					const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/auth/authenticate`);	
					setUserId(response.data.id);
					setAuthenticated(true);
					redirect();
				} catch (error : any) {
					//console.log(error.response.data);
					logout(() => redirect);
				}
			}
		  }, 500);
	}


	//puur om in te loggen op testgebruiker(verander de route op backend naar een testuser die jij in database hebt)
	const loginTestUser:AuthContextType["login42"] = (redirect) => {
		const Popup = popupwindow(`${process.env.REACT_APP_SERVER_URL}/auth/login/testuser`, 'Authentication', 500, 600);
		const timer = setInterval(async() => {
			if (Popup?.closed) {
				clearInterval(timer);
				try {
					const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/auth/authenticate`);
					setUserId(response.data.id);
					setAuthenticated(true);
					redirect();
				} catch (error : any) {
					//console.log(error.response.data);
					logout(() => redirect);
				}
			}
		  }, 500);
	}

	const loginTestUser2:AuthContextType["login42"] = (redirect) => {
		const Popup = popupwindow(`${process.env.REACT_APP_SERVER_URL}/auth/login/testuser2`, 'Authentication', 500, 600);
		const timer = setInterval(async() => {
			if (Popup?.closed) {
				clearInterval(timer);
				try {
					const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/auth/authenticate`);
					setUserId(response.data.id);
					setAuthenticated(true);
					redirect();
				} catch (error : any) {
					//console.log(error.response.data);
					logout(() => redirect);
				}
			}
		  }, 500);
	}
	
	async function logout(redirect: VoidFunction) {
		
		try {
			const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/auth/logout`);
			if (response.status === 200) {
				setAuthenticated(false);
				setUserId(0);
				redirect();
			} else {
				console.error('Logout failed:', response.statusText);
			}
		} catch (error: any) {
			console.log('Error during logout');
		}
	}
	
//! dit moet er weer in want dit is om te verifieren dat iemand wl echt op de backend ingelogd is
	useEffect(() => {
		const checkAuthentication = async () => {
			try {
				// Make a request to the backend to check if the user is authenticated
				const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/auth/authenticate`);
				setAuthenticated(true);
				setUserId(response.data.id);
			} catch (error: any) {
				//console.log('Error checking authentication');
				setAuthenticated(false);
			}
			finally {
				setLoading(false); // Set loading to false once the check is complete
			}
		};
		if (!authenticated) {
		  // If not authenticated locally, check with the backend
		  checkAuthentication();
		}
	  }, [authenticated]);

	  if (loading) {
		// Show a loading indicator or any other UI while authentication check is in progress
		return <p>Loading...</p>;
	  }


	return (
		<AuthContext.Provider value={{userId, authenticated, login, login42, logout, loginTestUser, loginTestUser2 }}>
			{children}
		</AuthContext.Provider>
	);
};

export const RequireAuth = ({ children } : { children: JSX.Element }) => {

	const { authenticated } = useAuth(); 
	const location = useLocation();

	return authenticated === false ? <Navigate to= "/login" state={{ from: location}} replace /> : children
}


export const useAuth = () => {
	return useContext(AuthContext);
}

export const LoginSuccess = () => {
	window.close();
	return <></>
}

export const TwoFactorAuth = () => {
	const [verificationCode, setverificationCode] = useState("");
	const [wrongCode, setWrongCode] = useState(false);
	const AuthInputRef = useRef<AuthCodeRef>(null);
	const auth = useAuth();

	useEffect(() => {
		if (auth.authenticated)
			window.location.pathname = '/';
	}, [auth.authenticated])
	
	
	const handleOnChange = (res: string) => {
	  setverificationCode(res);
	};
  
	async function verify2Fa() {
		try {
			(await axios.post(`${process.env.REACT_APP_SERVER_URL}/TwoFactorAuth/authenticate2Fa`, { code: verificationCode }));
			window.close();
		} catch(error: any) {
			setWrongCode(true);
		}
	}

	return (
	  <>
		<AuthCode onChange={handleOnChange} allowedCharacters='numeric' ref={AuthInputRef}/>
		<button onClick={() => AuthInputRef.current?.clear()}>Clear</button>
		<button onClick={verify2Fa}>Submit</button>
		
		{wrongCode && (<p>Invalid code, please try again</p>)}
	  </>
	);
};

export const Register = () => {

	const [formData, setFormData] = useState({
		username: '',
		password: '',
		confirmPassword: ''
	  });
	const [Success, setSuccess] = useState(false);
	const [errors, setErrors] = useState('');
	const [serverError, setServerError] = useState("");
	
	  const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({
		  ...formData,
		  [name]: value
		});
	  };
	
	  const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (formData.password !== formData.confirmPassword) {
		  setErrors('Passwords do not match');
		  return;
		}
	
		try {
		  const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/auth/register`, {
			userName: formData.username,
			password: formData.password
		  });
		  console.log('Registration successful:', response.data);
		  setSuccess(true);
		  setServerError("");
		} catch (error) {
		  console.error('Error registering:', error.response.data.message);
		  setServerError(error.response.data.message);
		}
	  };
	
	  return (
		<div>
		  <h2>Register</h2>
		  {errors && <p>{errors}</p>}
		  <form onSubmit={handleSubmit} style={{ display: 'table', margin: '0 auto' }}>
			<div style={{ display: 'table-row' }}>
				<label htmlFor="username" style={{ display: 'table-cell', padding: '10px', textAlign: 'right' }}>Username:</label>
				<input
				type="text"
				id="username"
				name="username"
				value={formData.username}
				onChange={handleChange}
				required
				style={{ display: 'table-cell', padding: '10px' }}
				/>
			</div>

			<div style={{ display: 'table-row' }}>
				<label htmlFor="password" style={{ display: 'table-cell', padding: '10px', textAlign: 'right' }}>Password:</label>
				<input
				type="password"
				id="password"
				name="password"
				value={formData.password}
				onChange={handleChange}
				required
				style={{ display: 'table-cell', padding: '10px' }}
				/>
			</div>

			<div style={{ display: 'table-row' }}>
				<label htmlFor="confirmPassword" style={{ display: 'table-cell', padding: '10px', textAlign: 'right' }}>Confirm Password:</label>
				<input
				type="password"
				id="confirmPassword"
				name="confirmPassword"
				value={formData.confirmPassword}
				onChange={handleChange}
				required
				style={{ display: 'table-cell', padding: '10px' }}
				/>
			</div>

			<div style={{ display: 'table-row' }}>
				<div style={{ display: 'table-cell', padding: '10px' }}></div> {/* Empty cell for alignment */}
				<button type="submit" style={{ display: 'table-cell', padding: '10px' }}>Submit</button>
			</div>
			</form>

		  {Success && (<p>Registration successful, Go to Home to login</p>)}
		<div><p>{serverError}</p></div>
		</div>
	  );
};

