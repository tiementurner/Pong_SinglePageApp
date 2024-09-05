import { useNavigate } from "react-router-dom"

import { UserType } from "../../Types"
import { useAuth } from "../Authenticate/AuthProvider"
import { SearchBar as FriendSearchBar } from "../Friends/Search"

const FriendButton = (props: {id: number, username: string}) => {

	const navigate = useNavigate();

	const handleClick = () => {
		navigate(`/profile/${props.id}`);
	}
	return (
		<button className="friend-button" onClick={handleClick}>
			{props.username}
		</button>
	)
}

const FriendsLayout = (props: {profile_id: number, friends: UserType[]}) => {

	const { userId } = useAuth();
	const noFriendsMsg = props.profile_id === userId ? "You don't have any friends yet. Use the search bar to find and add friends!" : "This user doesn't have any friends yet. Want to be their first friend?";

	return (
		<div className="friends-container">
			{
				props.profile_id === userId &&
					<FriendSearchBar />
			}
			{
				!props.friends.length &&
				<p>
					{noFriendsMsg}
				</p>
			}
			<div className="friend-list">	
				{ props.friends.map((friend) => (
				<li key={friend.id}>
					<FriendButton
						key={friend.id}
						id={friend.id}
						username={friend.username}
					/>
				</li>
				))}
			</div>
		</div>
	)
}

export default FriendsLayout;
