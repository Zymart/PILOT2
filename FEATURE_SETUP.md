# 🚀 Extended Features Setup Guide

## 📦 Installation Steps

### 1. Create the Features File
Create a new file called `features.js` in the same directory as your `index.js`.

Copy the code from the **features.js** artifact into this file.

### 2. Load the Features Module
Add this **ONE LINE** to your `index.js` file:

**Location:** Add it right after the `client` is created (after the `const client = new Client({ ... });` line)

```javascript
// Load extended features
require('./features.js')(client);
```

### 3. Environment Variables
Add this new environment variable to your `.env` or Replit Secrets:

```env
JSONBIN_BIN_ID_FEATURES=your_new_bin_id_here
```

**Note:** Create a separate JSONBin for features data (don't use the same one as your main data).

### 4. Restart Your Bot
After adding the line and environment variable, restart your bot.

---

## ✨ New Features Added

### 🏆 Leaderboard System
- **Commands:**
  - `!leaderboard` or `!lb` - View top 10 service providers
- **Features:**
  - Tracks completed orders per staff member
  - Shows average ratings
  - Medal rankings (🥇🥈🥉)
  - Auto-updates when tickets are completed

### ⭐ Rating System (1-5 Stars)
- **Commands:**
  - `!rate 1-5 [optional review]` - Rate a service (ticket only)
    - Example: `!rate 5 Great service!`
    - Example: `!rate 4`
  - `!ratings [@user]` - View ratings for yourself or another user
- **Features:**
  - 5-star rating system
  - Optional text reviews
  - Average rating calculation
  - Review history (shows last 5 reviews)
  - Only rate the staff member who claimed the ticket
  - Can't rate yourself

### ✋ Ticket Claim System
- **How it works:**
  - When a ticket is created, a **Claim Ticket** button appears
  - Staff click the button to claim the ticket
  - Only one person can claim per ticket
  - The claimer can unclaim using the **Unclaim** button
  - Owner can always unclaim any ticket
- **Features:**
  - Prevents multiple staff working on same ticket
  - Tracks who's handling each request
  - Integrates with leaderboard
  - Integrates with rating system

### ⏱️ Advanced Timer System (Ticket Only)
- **Commands:**
  - `!timer start` or `!timer` - Start a service timer
  - `!timer stop` - Stop the timer and show total time
  - `!timer pause` - Pause the timer
  - `!timer resume` - Resume a paused timer
  - `!timer + SECONDS` - Add time to the timer
    - Example: `!timer + 60` (adds 1 minute)
  - `!timer - SECONDS` - Subtract time from the timer
    - Example: `!timer - 30` (removes 30 seconds)
  - `!timer` (alone) - Check current timer status
- **Features:**
  - Tracks service completion time
  - Pause/resume functionality
  - Manual time adjustment (+/-)
  - Shows time in readable format (Xh Xm Xs)
  - Auto-stops when ticket is marked done
  - **Only works in tickets**

### 📝 Enhanced Transcript System
- **Commands:**
  - `!transcript` - Generate full ticket transcript
- **Features:**
  - Beautiful formatted text file
  - Includes all messages with timestamps
  - Shows embeds and attachments count
  - Professional layout with borders
  - Includes metadata (channel, guild, date)
  - Up to 100 messages captured

### 🎨 Enhanced Ticket Welcome Message
- **Features:**
  - Beautiful welcome embed when ticket opens
  - Shows what to expect
  - Estimated response time
  - Ticket status indicator
  - Claim button included
  - Professional appearance with server branding

---

## 🎮 Command Reference

### Leaderboard Commands
```
!leaderboard    - View top 10 service providers
!lb             - Shortcut for leaderboard
```

### Rating Commands
```
!rate 1-5 [review]     - Rate the service (1-5 stars)
!ratings               - View your ratings
!ratings @user         - View someone else's ratings
!reviews               - Same as !ratings
```

### Timer Commands (Ticket Only)
```
!timer start    - Start timer
!timer stop     - Stop timer
!timer pause    - Pause timer
!timer resume   - Resume timer
!timer + 60     - Add 60 seconds
!timer - 30     - Remove 30 seconds
!timer          - Check timer status
```

### Transcript Commands
```
!transcript    - Generate ticket transcript
```

### Ticket Buttons
```
Claim Ticket   - Claim a ticket (staff)
Unclaim        - Release claim (claimer/owner only)
```

---

## 📊 How It Works Together

### Ticket Workflow:
1. **User creates ticket** → Enhanced welcome message appears with Claim button
2. **Staff clicks Claim** → Ticket is assigned to them
3. **Staff uses `!timer start`** → Timer begins tracking service time
4. **Service is provided** → Timer running in background
5. **User rates with `!rate 5 Great!`** → Rating saved to staff member
6. **Ticket marked done** → Timer stops automatically, leaderboard updates
7. **Staff uses `!transcript`** → Full conversation saved for records

### Leaderboard Updates:
- Automatically updates when tickets are completed
- Shows completed order count
- Shows average rating from all reviews
- Ranks by completed orders (most to least)

---

## 🔧 Technical Details

### Data Storage
All features data is stored in a separate JSONBin:
- Ratings and reviews per user per guild
- Leaderboard data (completed orders, ratings)
- Claimed tickets (active claims)
- Active timers (start time, paused time)

### Permissions
- **Anyone** can use: `!leaderboard`, `!ratings`, `!rate` (in tickets)
- **Staff/Claimer** can use: Claim button, `!timer` commands, `!transcript`
- **Owner** can: Unclaim any ticket

### Integration
- Works seamlessly with existing ticket system
- No modifications needed to original index.js
- Self-contained in features.js
- Independent data storage

---

## ⚠️ Important Notes

1. **Timer is ticket-only** - Cannot be used outside tickets
2. **Rating requires claimed ticket** - Must have someone claim the ticket first
3. **Separate data storage** - Uses different JSONBin than main bot data
4. **Auto-cleanup** - Timers and claims cleared when ticket closes
5. **Anti-self-rating** - Users cannot rate themselves

---

## 🐛 Troubleshooting

### Features not loading?
- Check if `require('./features.js')(client);` is added to index.js
- Make sure features.js is in the same folder as index.js
- Check console for error messages

### Data not saving?
- Verify `JSONBIN_BIN_ID_FEATURES` environment variable is set
- Make sure it's a different bin than your main data
- Check JSONBin API key is valid

### Buttons not working?
- Restart the bot after adding features.js
- Check if ticket was created after features were loaded
- Old tickets won't have the new buttons

### Timer not starting?
- Make sure you're in a ticket channel (starts with `ticket-` or `shop-`)
- Check if timer is already running (`!timer` to check status)

---

## 🎉 Success Checklist

- [ ] Created `features.js` file
- [ ] Added `require('./features.js')(client);` to index.js
- [ ] Added `JSONBIN_BIN_ID_FEATURES` environment variable
- [ ] Restarted the bot
- [ ] Tested leaderboard command
- [ ] Tested rating system in a ticket
- [ ] Tested claim button on new ticket
- [ ] Tested timer commands
- [ ] Generated a transcript

---

## 📝 Notes

- All features work together seamlessly
- Data persists across bot restarts
- Leaderboard encourages quality service
- Rating system provides feedback
- Timer helps track efficiency
- Transcripts provide records

**Made with ❤️ for your Discord server!**