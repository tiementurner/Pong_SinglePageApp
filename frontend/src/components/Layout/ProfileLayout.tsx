import {
	Outlet,
	useNavigate,
	useParams } from 'react-router-dom';
import {
	useEffect,
	useState } from 'react';

import {
	ProfileData,
	StatsHistoryData,
	UserType,
	ProfileDisplay as Display } from '../../Types';
import {
	ProfileAvatar,
	ProfileName,
	ProfileStatus,
	ProfileInvite,
	ProfileAdd, 
	ProfileSendDM } from '../Profile/ProfileComponents';
import {
	History,
	Stats
} from '../Profile/StatsHistoryComponents';
import FriendsLayout from '../Friends/FriendsComponents';
import { useAuth } from '../Authenticate/AuthProvider';
import axios from '../../axiosInstance';
import { useNotification } from '../Notifications/NotificationProvider';

const initStats: StatsHistoryData = {
	matches: [],
	total: 0,
	wins: 0,
	draws: 0,
	losses: 0,
	rank: 'novice'
}

const initProfile: ProfileData = {
	id: 0,
	username: '',
	avatar: '',
	friends: [],
	statsHistory: initStats,
	isFriend: false
}

export const Profile = () => {
	const [data, setData] = useState<ProfileData>(initProfile);
	const {id} = useParams();
	const {reload} = useNotification();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/users/public/${id}`);
				setData(res.data);
			} catch (error: any) {
				console.log(error)
			}
		};
		fetchData();
	}, [id, reload]);

	return (
		<div className="profile-container">
			<ProfileTop
				profile_id={data.id}
				username={data.username}
				avatar={data.avatar}
				isFriend={data.isFriend}
			/>
			<ProfileBottom
				profile_id={data.id}
				friends={data.friends}
				statsHistory={data.statsHistory}
				// state={profileState}
				// setState={setProfileState}
			/>
		</div>
	);
}

export const ProfileLayout = () => {

	return (
		<Outlet/>
	)
}

export const ProfilePlaceholder = () => {
	const {userId} = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		navigate(`/profile/${userId}`, {replace: true})
	}, [userId])
	return (<></>)
}

const ProfileTop = (props: {profile_id: number, username: string, avatar: string, isFriend: boolean}) => {

	const { userId } = useAuth();

	return (
		<div className="profile-top-container">
			<ProfileAvatar
				avatar={props.avatar}
				userId={userId}
				profileId={props.profile_id}
			/>
			<ProfileNameStatus
				username={props.username}
				profileId={props.profile_id}
				isFriend={props.isFriend}
			/>
			<div className='profile-action-container'>
				{ props.profile_id !== userId && props.isFriend && <ProfileInvite profileId={props.profile_id} /> }
				{ props.profile_id !== userId && !props.isFriend && <ProfileAdd profileId={props.profile_id} /> }
				{ props.profile_id !== userId && props.isFriend && <ProfileSendDM profileId={props.profile_id} /> }
			</div>
		</div>
	);
}

const ProfileBottom = (props: {profile_id: number, friends: UserType[], statsHistory: StatsHistoryData}) => {

	const [profileState, setProfileState] = useState(Display.Friends);

	// const headerText = (props.state === Display.Friends ? "Friends" : "Stats");
	// const buttonText = (props.state === Display.Friends ? "Stats" : "Friends");

	// const handleClick = () => {
	// 	(props.state === Display.Stats ? props.setState(Display.Friends) : props.setState(Display.Stats))
	// }

	const headerText = (profileState === Display.Friends ? "Friends" : "Stats");
	const buttonText = (profileState === Display.Friends ? "Stats" : "Friends");

	const handleClick = () => {
		(profileState === Display.Stats ? setProfileState(Display.Friends) : setProfileState(Display.Stats))
	}

	return (
		<div className="profile-bottom-container">
			<div className="profile-change-display">
				<h3>{headerText}</h3>
				<button onClick={handleClick}>
					{buttonText}
				</button>
			</div>
				{ profileState === Display.Stats 
					? 
					<StatsHistoryLayout
						profileId={props.profile_id}
						statsHistory={props.statsHistory}/>
					:
					<FriendsLayout
						profile_id={props.profile_id}
						friends={props.friends} />
				}
		</div>
	)
}

const ProfileNameStatus = (props: {username: string, profileId: number, isFriend: boolean}) => {
	return (
		<div className="profile-name-status-container">
			<ProfileName name={props.username} />

			{
				props.isFriend &&
				<ProfileStatus profileId={props.profileId}/>
			}
		</div>
	);
}

const StatsHistoryLayout = (props: {profileId: number, statsHistory: StatsHistoryData}) => {

	return (
		<div className="stats-history-container">
			<Stats
				profileId={props.profileId}
				total={props.statsHistory.total}
				wins={props.statsHistory.wins}
				draws={props.statsHistory.draws}
				losses={props.statsHistory.losses}
				rank={props.statsHistory.rank}/>
			<h3>Match history</h3>
			<History
				profileId={props.profileId}
				matches={props.statsHistory.matches}/>
		</div>
	);
}

export default ProfileLayout;