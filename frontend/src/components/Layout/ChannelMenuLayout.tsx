import { useParams } from "react-router-dom";
import {
	createContext,
	useContext,
	useEffect,
	useState } from "react";
import {
	LeaveChannel,
	ChannelSettings } from "../Chat/ChannelMenu";
import {
	MemberBlockPresentation,
	MemberNamePresentation,
	MemberInviteMatchPresentation,
	MemberMutePresentation,
	MemberKickPresentation,
	MemberBanPresentation,
	MemberSetAdminPresentation,
	MemberunBlockPresentation } from "../Chat/Presentation/ChannelMemberPresentation";
import { useAuth } from "../Authenticate/AuthProvider";
import axios from '../../axiosInstance';
import { getIdFromURL } from "./ChatLayout";
import {
	Member,
	MemberContextType,
	ChannelInfoType } from "../../Types";


	//! to do: add user feedback on mute
const ChannelMenuLayout = () => {
	const [membersInfo, setMembersInfo] = useState<ChannelInfoType>(
		{
			members: [],
			admins: [],
			userIsAdmin: false,
			userIsOwner: false,
			isPrivate: false,
			isDM: false,
			name: ''
		}
	);
	const {id} = useParams();
	const [kicked, setReload] = useState<boolean>(false);
	const [blocked, setBlocked] = useState<number[]>([]);

	useEffect(() => {
		const getMembersInfo = async () => {
			const channelId = getIdFromURL();
			try {
				const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/chat/channel/${channelId}/info`);
				setMembersInfo(response.data);
			} catch (error: any) {
				console.log(error.response.data)
			}
		}
		getMembersInfo();
	}, [id, kicked])

	useEffect(() => {
		const getBlockedUsers = async () => {
			try {
				const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/chat/blocklist`);
				setBlocked(response.data);
			} catch (error: any) {
				console.log(error.response.data);
			}
		}
		getBlockedUsers();
	}, [id, kicked]);

	const handleKick = () => {
		setReload( prev=> !prev);
	};
	
	return (
		<div className="channel-menu-container">
			<div className="channel-menu-members-header">Members</div>
			<ChannelMemberList
				membersInfo={membersInfo}
				setReload={handleKick}
				blocked={blocked}
			/>
			{
				membersInfo.userIsOwner &&
				<ChannelSettings
					isPrivate={membersInfo.isPrivate}
					isDM={membersInfo.isDM}
					setReload={setReload}
				/>
			}
			<LeaveChannel/>
		</div>
	)
}

const ChannelMemberList = (props: {membersInfo: ChannelInfoType, setReload: any, blocked: number[]}) => {
	
	return (
		<div className="channel-member-list-container">
			{props.membersInfo.members.map((member) => (
				<li key={member.id}>
					<ChannelMemberLayout
						member={member}
						setReload={props.setReload}
						blocked={(props.blocked.includes(member.id)) ? true : false}
						userIsAdmin={props.membersInfo.userIsAdmin}
						userIsOwner={props.membersInfo.userIsOwner}/>
				</li>
			))}
		</div>
	);
}

export const ChannelMemberLayout = (props: {member: Member, setReload: any, blocked: boolean, userIsAdmin: boolean, userIsOwner: boolean}) => {

	return (
		<div className="channel-menu-member-container">
			<MemberProvider
				member={props.member}
				blocked={props.blocked}
				userIsAdmin={props.userIsAdmin}
				userIsOwner={props.userIsOwner}
			>
				<MemberNamePresentation />
				<div className="member-role-container">
					<p>
						{props.member.isAdmin && "   admin   "}
					</p>
					<p>

					{props.member.isOwner && "   owner   "}
					</p>
				</div>
				<MemberBlockPresentation setReload={props.setReload}/>
				<MemberunBlockPresentation setReload={props.setReload}/>
				<MemberInviteMatchPresentation />
				<MemberMutePresentation />
				<MemberKickPresentation setReload={props.setReload}/>
				<MemberBanPresentation setReload={props.setReload}/>
				<MemberSetAdminPresentation setReload={props.setReload} />
			</MemberProvider>
		</div>

	);
}

const InitMember : Member = {
	id: 0,
	username: '',
	isAdmin: false,
	isOwner: false
};

const MemberContext = createContext<MemberContextType>({member: InitMember, blocked: false, isUser: false, userIsAdmin: false, userIsOwner: false});

// Custom hook to consume the MemberContext
export const useMember = () => useContext(MemberContext);

// Provider component for the MemberContext
export const MemberProvider: React.FC<{member: Member, blocked: boolean, userIsAdmin: boolean, userIsOwner: boolean, children: React.ReactNode }> = ({ member, blocked, userIsAdmin, userIsOwner, children }) => {
	
	const { userId } = useAuth();
	const isUser = userId === member.id ? true : false;

	return (
        <MemberContext.Provider value={{member, blocked, isUser, userIsAdmin, userIsOwner}}>
            {children}
        </MemberContext.Provider>
    );
};

export default ChannelMenuLayout;