import { Link } from "react-router-dom";

import { useAuth } from "./Authenticate/AuthProvider";
import { SearchBar as FriendSearchBar } from "./Friends/Search";

const Home = () => {
	const {userId} = useAuth();
	const profileURL = `profile/${userId}`

	return (
		<div className="home-container">
			<h1> This is the homepage! </h1>
			<p>
				Want to change your <Link to='account'>
				account settings
				</Link> ?
			</p>
			<p>
				Want to see your <a onClick={() => {alert("You can't do that from here, this doesn't work. Check out the top right of the screen")}}>notifications</a>?
			</p>
			<div>
				Maybe you're feeling a little lonely, and you want to find new friends:
				<FriendSearchBar />
			</div>
			<div className="jan-container"/>
		</div>
	);
}

export default Home;