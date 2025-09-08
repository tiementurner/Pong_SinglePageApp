import { MemberName, MemberBlock, MemberInviteMatch, MemberMute, MemberKick, MemberBan, SetAdmin, MemberunBlock } from "../ChannelMenu";
import { useMember } from "../../Layout/ChannelMenuLayout";


const MemberNamePresentation = () => {
	const {member} = useMember();
	const {blocked} = useMember();
	const {isUser} = useMember();

	if (isUser) {
		return (
			<MemberName username={"you"} />
		)
	}
	if (blocked) {
		return (
			<MemberName username={"blocked user"} />
		)
	}

	return (
		<MemberName username={member.username}/>
	)
}

const MemberBlockPresentation = (props: {setReload: any}) => {

	const member = useMember();

	if (member.isUser || member.blocked) {
		return (null)
	}
	return (
		<MemberBlock setReload={props.setReload} />
	)
}

const MemberunBlockPresentation = (props: {setReload: any}) => {

	const member = useMember();

	if (member.isUser === true || member.blocked === false) {
		return (null)
	}
	return (
		<MemberunBlock setReload={props.setReload} />
	)
}

const MemberInviteMatchPresentation = () => {

	const member = useMember();

	if (member.isUser || member.blocked) {
		return (null)
	}
	return (
		<MemberInviteMatch />
	)
}

const MemberMutePresentation = () => {

	const member = useMember();

	if (member.isUser || !member.userIsAdmin) {
		return (null)
	}
	if (member.member.isOwner || member.blocked)
		return (null)
	return (
		<MemberMute />
	)
}

//admins can kick. ban, or mnute other people (incl admins) but not the channel owner
const MemberKickPresentation = (props: {setReload: any}) => {

	const member = useMember();

	if (member.isUser || !member.userIsAdmin)
		return (null);
	if (member.member.isOwner || member.blocked)
		return (null);
	return (
		<MemberKick setReload={props.setReload}/>
	)
}

const MemberBanPresentation = (props: {setReload: any}) => {

	const member = useMember();

	if (member.isUser || !member.userIsAdmin)
		return (null);
	if (member.member.isOwner || member.blocked)
		return (null)
	return (
		<MemberBan setReload={props.setReload}/>
	)
}

const MemberSetAdminPresentation = (props: {setReload: any}) => {

	const member = useMember();

	if (member.isUser || !member.userIsOwner)
		return (null)
	else if (member.isUser || member.member.isAdmin || member.blocked){
		return (null);
	}
	return (
		<SetAdmin setReload={props.setReload}/>
	)
}

export { MemberBlockPresentation, MemberunBlockPresentation, MemberNamePresentation, MemberInviteMatchPresentation, MemberMutePresentation, MemberKickPresentation, MemberBanPresentation, MemberSetAdminPresentation };