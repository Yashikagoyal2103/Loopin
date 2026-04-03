import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// ==================== INTERFACES ====================

interface IUser {
    email: string;
    password: string;
    full_name: string;
    username: string;
    bio: string;
    location: string;
    profile_picture: string;
    cover_picture: string;
    emailVerified: boolean;
    authProvider: string;
    vibe?: string;
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    connections: mongoose.Types.ObjectId[];
}

interface IPost {
    user: mongoose.Types.ObjectId;
    content: string;
    post_type: string;
    image_urls: string[];
    likes: mongoose.Types.ObjectId[];
    comments: {
        user: mongoose.Types.ObjectId;
        content: string;
        createdAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

interface IComment {
    user: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
}

interface UserData {
    full_name: string;
    username: string;
    email: string;
    bio: string;
    location: string;
    profile_picture: string;
    cover_picture: string;
    vibe: string;
}

interface PostData {
    content: string;
    post_type: string;
    image_urls: string[];
}

interface FollowRelation {
    follower: string;
    following: string;
}

// ==================== SCHEMAS ====================

const userSchema = new mongoose.Schema<IUser>({
    email: { type: String, required: true },
    password: { type: String, required: true },
    full_name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    profile_picture: { type: String, default: '' },
    cover_picture: { type: String, default: '' },
    emailVerified: { type: Boolean, default: false },
    authProvider: { type: String, default: 'local' },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const postSchema = new mongoose.Schema<IPost>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    post_type: { type: String, default: 'text' },
    image_urls: { type: [String], default: [] },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// ==================== DATA ====================

const usersData: UserData[] = [
    {
        full_name: "Luna Chen",
        username: "lunalovegood_vibes",
        email: "luna@loopin.com",
        bio: "✨ professional overthinker | matcha addict | manifesting my soft girl era 💅\n📍 currently living in my delulu era",
        location: "Brooklyn, NY (in my head)",
        profile_picture: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
        cover_picture: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
        vibe: "Soft Girl Aesthetic"
    },
    {
        full_name: "Alex Martinez",
        username: "chaos_theory",
        email: "alex@loopin.com",
        bio: "🏴‍☠️ professional yapper | sleep is for the weak | will argue about anything \n⚠️ warning: may trauma dump mid-conversation",
        location: "Austin, TX (send help)",
        profile_picture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
        cover_picture: "https://images.unsplash.com/photo-1513151233558-860c5394c75d",
        vibe: "Chaos Gremlin"
    },
    {
        full_name: "Zara Williams",
        username: "zarathedream",
        email: "zara@loopin.com",
        bio: "👑 CEO of my own delusions | fashion week reject | ✨ hot girl era activated \n📧 business inquiries: makeitmake@sense.com",
        location: "LA (manifesting)",
        profile_picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
        cover_picture: "https://images.unsplash.com/photo-1483985988353-7c7f6d2a7fc1",
        vibe: "The It Girl"
    },
    {
        full_name: "Kai Park",
        username: "existentialkai",
        email: "kai@loopin.com",
        bio: "🌙 3AM thoughts enjoyer | film photography nerd | professional sad boi \n📽️ currently: overanalyzing everything",
        location: "Seoul / Portland (depends on my mood)",
        profile_picture: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
        cover_picture: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4",
        vibe: "The Deep Thinker"
    },
    {
        full_name: "Jordan Taylor",
        username: "meme_junkie",
        email: "jordan@loopin.com",
        bio: "📱 professional screen time haver | meme curator | will laugh at my own jokes \n⚠️ humor may be broken, proceed with caution",
        location: "my moms basement (temporarily)",
        profile_picture: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79",
        cover_picture: "https://images.unsplash.com/photo-1554177255-61502b352de3",
        vibe: "The Meme Lord"
    },
    {
        full_name: "Maya Singh",
        username: "fit_maya",
        email: "maya@loopin.com",
        bio: "🏋️‍♀️ gym rat | smoothie bowl enthusiast | ✨ healing my inner child through exercise \n📈 on a journey to be the hottest version of myself",
        location: "Toronto (cold girl walks)",
        profile_picture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
        cover_picture: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
        vibe: "The Fitness Bestie"
    },
    {
        full_name: "Indigo Blue",
        username: "indigoblue",
        email: "indigo@loopin.com",
        bio: "🎨 painting my feelings (literally) | thrift store royalty | ✨ curating my reality \n☕ coffee is my medium",
        location: "Portland, OR (very on brand)",
        profile_picture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
        cover_picture: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b",
        vibe: "The Artsy One"
    },
    {
        full_name: "Leo Zhang",
        username: "leo_lvl99",
        email: "leo@loopin.com",
        bio: "🎮 professional button masher | 🥤 gamer fuel connoisseur | ✨ grinding irl \n🕹️ currently: losing at life but winning at games",
        location: "basement (gaming setup)",
        profile_picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
        cover_picture: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
        vibe: "The Gamer/Streamer"
    }
];

const postsData: Record<string, PostData[]> = {
    "lunalovegood_vibes": [
        {
            content: "just cried over a tiktok ad. marketing is getting too good 🥲 #softgirlera",
            post_type: "text",
            image_urls: []
        },
        {
            content: "my toxic trait is thinking i can fix him 🤡",
            post_type: "text",
            image_urls: []
        },
        {
            content: "hot girl walk? no. hot girl rot in bed? yes. 💅✨",
            post_type: "text_with_image",
            image_urls: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446"]
        },
        {
            content: "romanticizing my life one overpriced matcha at a time 🍵",
            post_type: "text_with_image",
            image_urls: ["https://images.unsplash.com/photo-1515823064-d6e0c04616a7"]
        }
    ],
    "chaos_theory": [
        {
            content: "my attention span is so bad that i— *squirrel* 🐿️",
            post_type: "text",
            image_urls: []
        },
        {
            content: "just spent 3 hours making a playlist for my imaginary road trip. worth it? absolutely.",
            post_type: "text",
            image_urls: []
        },
        {
            content: "who decided adulting was a good idea? i want a refund and a manager 😤",
            post_type: "text_with_image",
            image_urls: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e"]
        }
    ],
    "zarathedream": [
        {
            content: "glow up is crazy when you stop caring what people think 💅✨",
            post_type: "text",
            image_urls: []
        },
        {
            content: "currently accepting applications for: sugar daddy, personal chef, and hype man 📝",
            post_type: "text",
            image_urls: []
        },
        {
            content: "she believed she could so she did (after crying for 3 hours and eating ice cream)",
            post_type: "text_with_image",
            image_urls: ["https://images.unsplash.com/photo-1524504384850-549a1dc8b121"]
        }
    ],
    "existentialkai": [
        {
            content: "sometimes i wonder if my phone listens to me or if i'm just that predictable",
            post_type: "text",
            image_urls: []
        },
        {
            content: "sunset > sunrise. night owls rise up (at 2pm after sleeping through 5 alarms)",
            post_type: "text",
            image_urls: []
        },
        {
            content: "romanticizing my life one overpriced coffee at a time ☕",
            post_type: "text_with_image",
            image_urls: ["https://images.unsplash.com/photo-1442512595331-e89e73853f31"]
        }
    ],
    "meme_junkie": [
        {
            content: "my sleep schedule is a suggestion, not a commitment 🥱",
            post_type: "text",
            image_urls: []
        },
        {
            content: "pov: you're explaining your hyperfixation to someone who didn't ask (but i'm gonna tell you anyway)",
            post_type: "text",
            image_urls: []
        },
        {
            content: "i put the 'pro' in procrastination and the 'crastination' in... wait, let me start over",
            post_type: "text_with_image",
            image_urls: ["https://images.unsplash.com/photo-1555685812-4b943f1cb0eb"]
        }
    ],
    "fit_maya": [
        {
            content: "leg day = cry day. but we still show up 💪😤",
            post_type: "text",
            image_urls: []
        },
        {
            content: "my pre-workout is anxiety and a dream. also caffeine. mostly caffeine.",
            post_type: "text",
            image_urls: []
        },
        {
            content: "abs are made in the kitchen. and also in therapy. and also in my head.",
            post_type: "text_with_image",
            image_urls: ["https://images.unsplash.com/photo-1517838277536-f5f99be501cd"]
        }
    ],
    "indigoblue": [
        {
            content: "my art is just organized chaos. much like my brain. 🎨",
            post_type: "text",
            image_urls: []
        },
        {
            content: "who needs therapy when you have a paintbrush and existential dread? (kidding, go to therapy)",
            post_type: "text",
            image_urls: []
        },
        {
            content: "creating my dream life one canvas at a time 🖼️✨",
            post_type: "text_with_image",
            image_urls: ["https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b"]
        }
    ],
    "leo_lvl99": [
        {
            content: "i'm not addicted to gaming. i'm committed to the grind. 💻🎮",
            post_type: "text",
            image_urls: []
        },
        {
            content: "sleep is for the weak. rank is for the strong. (says while falling asleep at 3am)",
            post_type: "text",
            image_urls: []
        },
        {
            content: "my k/d ratio in life is not as good as in games. send help and energy drinks.",
            post_type: "text_with_image",
            image_urls: ["https://images.unsplash.com/photo-1542751371-adc38448a05e"]
        }
    ]
};

const followRelationships: FollowRelation[] = [
    { follower: "chaos_theory", following: "lunalovegood_vibes" },
    { follower: "chaos_theory", following: "meme_junkie" },
    { follower: "zarathedream", following: "lunalovegood_vibes" },
    { follower: "zarathedream", following: "fit_maya" },
    { follower: "existentialkai", following: "indigoblue" },
    { follower: "existentialkai", following: "lunalovegood_vibes" },
    { follower: "meme_junkie", following: "chaos_theory" },
    { follower: "meme_junkie", following: "leo_lvl99" },
    { follower: "fit_maya", following: "zarathedream" },
    { follower: "fit_maya", following: "lunalovegood_vibes" },
    { follower: "indigoblue", following: "existentialkai" },
    { follower: "indigoblue", following: "lunalovegood_vibes" },
    { follower: "leo_lvl99", following: "meme_junkie" },
    { follower: "leo_lvl99", following: "chaos_theory" }
];

const commentTexts: string[] = [
    "this is so real 😭",
    "felt that 💯",
    "literally me fr fr",
    "couldn't agree more ✨",
    "this post called me out",
    "so true bestie",
    "my toxic trait is relating to this",
    "are you me??",
    "sending this to my group chat",
    "the way i feel seen rn"
];

// ==================== MAIN FUNCTION ====================

async function seedCompleteData(): Promise<void> {
    try {
        // Connect to database
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined in environment variables');
        }
        
        await mongoose.connect(process.env.DATABASE_URL!, {
            dbName: 'LoopinDatabase'
        });
        console.log('📦 Connected to database' );
    
        
        // Create models
        const User = mongoose.model<IUser>('User', userSchema);
        const Post = mongoose.model<IPost>('Post', postSchema);
        
        const defaultPassword: string = await bcrypt.hash('Test123!', 12);
        const createdUsers: Record<string, any> = {};
        
        // Create users
        console.log('\n👥 Creating users...');
        for (const userData of usersData) {
            const user = await User.create({
                ...userData,
                password: defaultPassword,
                emailVerified: true,
                authProvider: 'local',
                followers: [],
                following: [],
                connections: []
            });
            createdUsers[user.username] = user;
            console.log(`✅ Created: ${user.username} (${userData.vibe})`);
        }
        
        // Create follow relationships
        console.log('\n🔗 Creating follow relationships...');
        for (const relation of followRelationships) {
            const follower: any = createdUsers[relation.follower];
            const following: any = createdUsers[relation.following];
            
            if (follower && following) {
                follower.following.push(following._id);
                following.followers.push(follower._id);
                await follower.save();
                await following.save();
                console.log(`✅ ${relation.follower} → following → ${relation.following}`);
            }
        }
        
        // Create posts
        console.log('\n📝 Creating posts...');
        for (const [username, posts] of Object.entries(postsData)) {
            const user: any = createdUsers[username];
            if (user) {
                for (const postData of posts) {
                    await Post.create({
                        user: user._id,
                        content: postData.content,
                        post_type: postData.post_type,
                        image_urls: postData.image_urls || [],
                        likes: [],
                        comments: [],
                        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
                    });
                }
                console.log(`✅ Added ${posts.length} posts for: ${username}`);
            }
        }
        
        // Add likes and comments to posts
        console.log('\n💬 Adding interactions...');
        const allPosts = await Post.find();
        const allUsers = Object.values(createdUsers);
        
        for (const post of allPosts) {
            // Add random likes (2-5)
            const likeCount: number = Math.floor(Math.random() * 4) + 2;
            const shuffledUsers = [...allUsers].sort(() => 0.5 - Math.random());
            
            for (let i = 0; i < Math.min(likeCount, shuffledUsers.length); i++) {
                const user = shuffledUsers[i] as any;
                if (!post.likes.includes(user._id)) {
                    post.likes.push(user._id);
                }
            }
            
            // Add random comments (1-3)
            const commentCount: number = Math.floor(Math.random() * 3) + 1;
            const comments: IComment[] = [];
            
            for (let i = 0; i < Math.min(commentCount, shuffledUsers.length); i++) {
                const user = shuffledUsers[i] as any;
                comments.push({
                    user: user._id,
                    content: commentTexts[Math.floor(Math.random() * commentTexts.length)]!,
                    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
                });
            }
            post.comments = comments;
            await post.save();
        }
        
        // Get statistics
        const totalPosts: number = await Post.countDocuments();
        const likeStats = await Post.aggregate([
            { $project: { likeCount: { $size: "$likes" } } }
        ]);
        const totalLikes: number = likeStats.reduce((sum: number, doc: any) => sum + doc.likeCount, 0);
        
        const commentStats = await Post.aggregate([
            { $project: { commentCount: { $size: "$comments" } } }
        ]);
        const totalComments: number = commentStats.reduce((sum: number, doc: any) => sum + doc.commentCount, 0);
        
        // Print summary
        console.log('\n🎉 ========== SEEDING COMPLETE ==========');
        console.log(`📊 Statistics:`);
        console.log(`   👥 Users: ${allUsers.length}`);
        console.log(`   📝 Posts: ${totalPosts}`);
        console.log(`   ❤️ Total Likes: ${totalLikes}`);
        console.log(`   💬 Total Comments: ${totalComments}`);
        console.log(`   🔗 Follow relationships: ${followRelationships.length}`);
        console.log('\n🔐 Login Credentials:');
        console.log('   Password for ALL users: Test123!');
        console.log('\n📧 Available emails:');
        usersData.forEach(u => console.log(`   - ${u.email}`));
        console.log('\n💡 Tip: You can edit data directly in MongoDB Compass');
        console.log('==========================================\n');
        
        // Disconnect
        await mongoose.disconnect();
        console.log('✅ Disconnected from database');
        
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

// Run the seed function
seedCompleteData();