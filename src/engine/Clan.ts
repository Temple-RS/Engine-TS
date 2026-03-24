import Player from './entity/Player.js';

export default class Clan {
    name: string;
    owner: string; // username of the creator (lowercase)
    members: Set<Player> = new Set();
    memberNames: Set<string> = new Set(); // usernames of all persistent members (offline too)
    locked: boolean = false;
    invites: Set<string> = new Set(); // usernames (lowercase)

    constructor(name: string, owner: string | Player) {
        this.name = name;
        if (typeof owner === 'string') {
            const ownerName = owner.toLowerCase();
            this.owner = ownerName;
            this.memberNames.add(ownerName);
        } else {
            const ownerName = owner.username.toLowerCase();
            this.owner = ownerName;
            this.members.add(owner);
            this.memberNames.add(ownerName);
        }
    }

    get score(): number {
        let total = 0;
        // Optimization: If we only have online players in the Set, we sum them.
        // If the user wants ALL members, we'd need to fetch offline total levels from DB.
        // For now, let's sum ALL online members or all known members at the time they were online.
        
        // Actually, if we track memberNames, we could fetch their stats.
        // For a quick implementation, let's sum CURRENT online members.
        for (const player of this.members) {
            total += player.totalLevel;
        }
        return total;
    }

    isOwner(player: Player): boolean {
        return player.username.toLowerCase() === this.owner;
    }

    canJoin(player: Player): boolean {
        if (this.memberNames.size >= 100) {
            return false;
        }
        
        if (this.locked) {
            return this.invites.has(player.username.toLowerCase());
        }
        
        return true;
    }

    addMember(player: Player): boolean {
        if (this.memberNames.size >= 100) {
            return false;
        }
        
        this.members.add(player);
        this.memberNames.add(player.username.toLowerCase());
        this.invites.delete(player.username.toLowerCase()); // consume invite
        return true;
    }

    removeMember(player: Player): void {
        this.members.delete(player);
        this.memberNames.delete(player.username.toLowerCase());
        
        // If owner leaves, pick another leader? 
        // For now, if owner leaves, the clan remains? Or just owner cannot leave?
    }
}
