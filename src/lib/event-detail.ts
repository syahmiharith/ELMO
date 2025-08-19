
import { EventDetail } from '@elmo/shared-types';

export const eventDetails: Record<string, EventDetail> = {
    'event-1': {
        descriptionHtml: `
      <h2>Join us for an exciting introduction to the world of Artificial Intelligence!</h2>
      <p>This workshop is designed for complete beginners. We'll cover the fundamental concepts of machine learning, neural networks, and their real-world applications. By the end of the session, you'll have a clear understanding of what AI is and how it's shaping our future.</p>
      <h3>What to bring:</h3>
      <ul>
        <li>A laptop (Windows, Mac, or Linux) with a web browser.</li>
        <li>A curious mind and plenty of questions!</li>
        <li>(Optional) Your favorite notebook and pen.</li>
      </ul>
      <p>Snacks and refreshments will be provided. We look forward to seeing you there!</p>
    `,
        tags: ['AI', 'Workshop', 'Beginner-Friendly', 'Free Snacks'],
    },
    'event-2': {
        descriptionHtml: `
      <h2>Witness the clash of wits at the Annual Regional Debate Tournament!</h2>
      <p>Top teams from universities across the region will compete for the championship title. This is a fantastic opportunity to see skilled debaters in action, learn about pressing contemporary issues, and support your university's team.</p>
      <h3>Format:</h3>
      <p>The tournament will follow the British Parliamentary debate format. Each round will feature a different motion announced 15 minutes prior to the start.</p>
      <p>Spectators are welcome and encouraged to attend. Come and be part of the excitement!</p>
    `,
        tags: ['Debate', 'Competition', 'Public Speaking', 'Paid'],
    },
    'event-3': {
        descriptionHtml: `
      <h2>Got a poem, a story, or a song to share? The stage is yours!</h2>
      <p>Our Open Mic Night is a welcoming and supportive space for all creative individuals to express themselves. Whether you're a seasoned performer or a first-timer, we invite you to share your work with a friendly audience.</p>
      <h3>Sign-ups:</h3>
      <p>Sign-ups will be available at the door on a first-come, first-served basis. Each performer will have a 5-minute slot.</p>
      <p>Come to perform, or just come to listen and enjoy the creative atmosphere. See you there!</p>
    `,
        tags: ['Creative Writing', 'Performance', 'Social', '5-min slots'],
    },
    'event-4': {
        descriptionHtml: `
      <h2>Ready, set, build! The Robotics Hackathon is here.</h2>
      <p>This is the official kick-off meeting for our weekend-long hackathon. We'll be announcing the challenge, going over the rules, and helping participants form teams. This is your chance to meet fellow builders, brainstorm innovative ideas, and prepare for an intense and rewarding weekend of creating.</p>
      <h3>What to expect:</h3>
      <ul>
        <li>Official hackathon theme and challenge reveal.</li>
        <li>Team formation and networking session.</li>
        <li>Q&A with mentors and organizers.</li>
        <li>Distribution of hardware kits (for registered participants).</li>
      </ul>
      <p>Even if you don't have a team yet, come along! This is the perfect opportunity to find one.</p>
    `,
        tags: ['Robotics', 'Hackathon', 'Engineering', 'Free Hardware'],
    },
};

