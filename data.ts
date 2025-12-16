
import { GitaVerse, Achievement } from './types';
import { Scroll, Flame, BookOpen, Moon, Shield, Heart, Star, BookMarked, Trophy, Zap, Medal, Sun, Flower, Anchor, Gem, Crown, Feather, Mountain } from 'lucide-react';

// Verse counts for each of the 18 chapters of Bhagavad Gita
export const GITA_CHAPTER_COUNTS: Record<number, number> = {
  1: 47, 2: 72, 3: 43, 4: 42, 5: 29, 6: 47, 
  7: 30, 8: 28, 9: 34, 10: 42, 11: 55, 12: 20, 
  13: 34, 14: 27, 15: 20, 16: 24, 17: 28, 18: 78
};

// Helper to count saved verses by category tag
const countSavedByCategory = (savedVerses: GitaVerse[], tag: string) => savedVerses.filter(v => v.tags.includes(tag)).length;

export const ACHIEVEMENTS: Achievement[] = [
  // --- READING MILESTONES ---
  {
      id: 'novice',
      name: 'The Awakening',
      sanskritName: 'Jagriti',
      description: 'Start your journey by reading 1 verse.',
      icon: Scroll,
      condition: (read, saved) => read >= 1,
      color: 'from-amber-100 to-amber-50 border-amber-200 text-amber-700 dark:from-amber-900/30 dark:to-amber-800/20 dark:border-amber-700 dark:text-amber-400'
  },
  {
      id: 'practitioner',
      name: 'The Practitioner',
      sanskritName: 'Sadhaka',
      description: 'Read 10 verses to build a spiritual habit.',
      icon: Flame,
      condition: (read, saved) => read >= 10,
      color: 'from-orange-100 to-orange-50 border-orange-200 text-orange-700 dark:from-orange-900/30 dark:to-orange-800/20 dark:border-orange-700 dark:text-orange-400'
  },
  {
      id: 'dedicated',
      name: 'Dedicated Soul',
      sanskritName: 'Nishtha',
      description: 'Read 25 verses. Your commitment is growing.',
      icon: Anchor,
      condition: (read, saved) => read >= 25,
      color: 'from-teal-100 to-teal-50 border-teal-200 text-teal-700 dark:from-teal-900/30 dark:to-teal-800/20 dark:border-teal-700 dark:text-teal-400'
  },
  {
      id: 'wise',
      name: 'The Wise',
      sanskritName: 'Jnani',
      description: 'Gain knowledge by reading 50 verses.',
      icon: BookOpen,
      condition: (read, saved) => read >= 50,
      color: 'from-blue-100 to-blue-50 border-blue-200 text-blue-700 dark:from-blue-900/30 dark:to-blue-800/20 dark:border-blue-700 dark:text-blue-400'
  },
  {
      id: 'steady',
      name: 'Steady Wisdom',
      sanskritName: 'Sthitaprajna',
      description: 'Achieve the milestone of 100 verses read.',
      icon: Star,
      condition: (read, saved) => read >= 100,
      color: 'from-purple-100 to-purple-50 border-purple-200 text-purple-700 dark:from-purple-900/30 dark:to-purple-800/20 dark:border-purple-700 dark:text-purple-400'
  },
  {
      id: 'enlightened',
      name: 'Illuminated Mind',
      sanskritName: 'Prakasha',
      description: 'Read 250 verses. The light of wisdom shines bright.',
      icon: Sun,
      condition: (read, saved) => read >= 250,
      color: 'from-yellow-100 to-yellow-50 border-yellow-200 text-yellow-700 dark:from-yellow-900/30 dark:to-yellow-800/20 dark:border-yellow-700 dark:text-yellow-400'
  },
   {
      id: 'sage',
      name: 'The Great Sage',
      sanskritName: 'Maharishi',
      description: 'Read 500 verses. You are a reservoir of truth.',
      icon: Mountain,
      condition: (read, saved) => read >= 500,
      color: 'from-slate-100 to-slate-50 border-slate-200 text-slate-700 dark:from-slate-900/30 dark:to-slate-800/20 dark:border-slate-700 dark:text-slate-400'
  },

  // --- COLLECTION MILESTONES ---
  {
      id: 'collector',
      name: 'The Collector',
      sanskritName: 'Sangraha',
      description: 'Save your first verse.',
      icon: BookMarked,
      condition: (read, saved) => saved.length >= 1,
      color: 'from-emerald-100 to-emerald-50 border-emerald-200 text-emerald-700 dark:from-emerald-900/30 dark:to-emerald-800/20 dark:border-emerald-700 dark:text-emerald-400'
  },
  {
      id: 'treasurer',
      name: 'Ocean of Gems',
      sanskritName: 'Ratnakara',
      description: 'Curate a collection of 10 saved verses.',
      icon: Trophy,
      condition: (read, saved) => saved.length >= 10,
      color: 'from-rose-100 to-rose-50 border-rose-200 text-rose-700 dark:from-rose-900/30 dark:to-rose-800/20 dark:border-rose-700 dark:text-rose-400'
  },
  {
      id: 'library_light',
      name: 'Library of Light',
      sanskritName: 'Jyotir Bhavan',
      description: 'Save 25 verses. A sanctuary of peace.',
      icon: Gem,
      condition: (read, saved) => saved.length >= 25,
      color: 'from-fuchsia-100 to-fuchsia-50 border-fuchsia-200 text-fuchsia-700 dark:from-fuchsia-900/30 dark:to-fuchsia-800/20 dark:border-fuchsia-700 dark:text-fuchsia-400'
  },

  // --- PATH SPECIFIC ---
  {
      id: 'karma_yogi',
      name: 'Karma Yogi',
      sanskritName: 'Path of Action',
      description: 'Save 3 verses related to Duty or Work.',
      icon: Shield,
      condition: (read, saved) => countSavedByCategory(saved, 'Duty') >= 3,
      color: 'from-red-100 to-red-50 border-red-200 text-red-700 dark:from-red-900/30 dark:to-red-800/20 dark:border-red-700 dark:text-red-400'
  },
  {
      id: 'bhakti_yogi',
      name: 'Bhakti Yogi',
      sanskritName: 'Path of Devotion',
      description: 'Save 3 verses related to Devotion or Love.',
      icon: Heart,
      condition: (read, saved) => countSavedByCategory(saved, 'Devotion') >= 3,
      color: 'from-pink-100 to-pink-50 border-pink-200 text-pink-700 dark:from-pink-900/30 dark:to-pink-800/20 dark:border-pink-700 dark:text-pink-400'
  },
  {
      id: 'jnana_yogi',
      name: 'Jnana Yogi',
      sanskritName: 'Path of Knowledge',
      description: 'Save 3 verses related to Knowledge or Truth.',
      icon: Feather,
      condition: (read, saved) => countSavedByCategory(saved, 'Knowledge') >= 3,
      color: 'from-cyan-100 to-cyan-50 border-cyan-200 text-cyan-700 dark:from-cyan-900/30 dark:to-cyan-800/20 dark:border-cyan-700 dark:text-cyan-400'
  },
  {
      id: 'dhyana_yogi',
      name: 'Dhyana Yogi',
      sanskritName: 'Path of Meditation',
      description: 'Save 3 verses related to Meditation or Focus.',
      icon: Moon,
      condition: (read, saved) => countSavedByCategory(saved, 'Meditation') >= 3,
      color: 'from-indigo-100 to-indigo-50 border-indigo-200 text-indigo-700 dark:from-indigo-900/30 dark:to-indigo-800/20 dark:border-indigo-700 dark:text-indigo-400'
  },
  {
      id: 'raja_yogi',
      name: 'Master of Self',
      sanskritName: 'Raja Yoga',
      description: 'Save 3 verses related to Self-Control.',
      icon: Zap,
      condition: (read, saved) => countSavedByCategory(saved, 'Self-Control') >= 3,
      color: 'from-lime-100 to-lime-50 border-lime-200 text-lime-700 dark:from-lime-900/30 dark:to-lime-800/20 dark:border-lime-700 dark:text-lime-400'
  },

  // --- SPECIAL ---
  {
      id: 'ekadashi',
      name: 'The Disciplined',
      sanskritName: 'Ekadashi',
      description: 'Read 11 verses, marking a step of discipline.',
      icon: Flower,
      condition: (read, saved) => read >= 11,
      color: 'from-violet-100 to-violet-50 border-violet-200 text-violet-700 dark:from-violet-900/30 dark:to-violet-800/20 dark:border-violet-700 dark:text-violet-400'
  },
  {
      id: 'arjuna',
      name: 'Arjuna\'s Focus',
      sanskritName: 'Ekagrata',
      description: 'Read 50 verses and save 5 about Self-Control.',
      icon: Medal,
      condition: (read, saved) => read >= 50 && countSavedByCategory(saved, 'Self-Control') >= 5,
      color: 'from-sky-100 to-sky-50 border-sky-200 text-sky-700 dark:from-sky-900/30 dark:to-sky-800/20 dark:border-sky-700 dark:text-sky-400'
  },
  {
      id: 'devotee_supreme',
      name: 'Divine Union',
      sanskritName: 'Yoga Yukta',
      description: 'Read 200 verses and Save 20. A master of wisdom.',
      icon: Crown,
      condition: (read, saved) => read >= 200 && saved.length >= 20,
      color: 'from-saffron-100 to-saffron-50 border-saffron-200 text-saffron-800 dark:from-saffron-900/30 dark:to-saffron-800/20 dark:border-saffron-700 dark:text-saffron-400'
  }
];

// ... (Rest of data.ts remains unchanged: INITIAL_VERSES, CATEGORIES)
export const INITIAL_VERSES: GitaVerse[] = [
  {
    id: 1,
    chapter: 2,
    verse: 47,
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    transliteration: "karmaṇy-evādhikāras te mā phaleṣu kadācana\nmā karma-phala-hetur bhūr mā te saṅgo ’stv akarmaṇi",
    translation: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself the cause of the results of your activities, nor be attached to inaction.",
    coreTeaching: "Focus entirely on the process and the effort, not the outcome. When we obsess over results, we become anxious and inefficient. Detachment from the result brings peace and mastery over action.",
    practicalApplication: "In your career, focus on doing excellent work rather than worrying constantly about the promotion or praise. In relationships, give love without calculating what you get in return. This reduces stress and burnout.",
    tags: ["Duty", "Work", "Stress"]
  },
  {
    id: 2,
    chapter: 2,
    verse: 20,
    sanskrit: "न जायते म्रियते वा कदाचि-\nन्नायं भूत्वा भविता वा न भूयः।\nअजो नित्यः शाश्वतोऽयं पुराणो\nन हन्यते हन्यमाने शरीरे॥",
    transliteration: "na jāyate mriyate vā kadācin\nnāyaṁ bhūtvā bhavitā vā na bhūyaḥ\najo nityaḥ śāśvato ’yaṁ purāṇo\nna hanyate hanyamāne śarīre",
    translation: "For the soul there is neither birth nor death at any time. He has not come into being, does not come into being, and will not come into being. He is unborn, eternal, ever-existing and primeval. He is not slain when the body is slain.",
    coreTeaching: "Your true self (Atman) is indestructible and eternal. Identifying with the temporary body causes fear of death and change. Realizing your eternal nature brings fearlessness.",
    practicalApplication: "When facing a major loss or change, remember that the core of who you are cannot be damaged or destroyed. Use this to build resilience in the face of life's inevitable transitions.",
    tags: ["Knowledge", "Self", "Fearlessness"]
  },
  {
    id: 3,
    chapter: 6,
    verse: 5,
    sanskrit: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥",
    transliteration: "uddhared ātmanātmānaṁ nātmānam avasādayet\nātmaiva hy ātmano bandhur ātmaiva ripur ātmanaḥ",
    translation: "One must deliver himself with the help of his mind, and not degrade himself. The mind is the friend of the conditioned soul, and his enemy as well.",
    coreTeaching: "You are your own best friend or worst enemy. It depends on whether you control your mind or let it control you. Self-responsibility is the key to growth.",
    practicalApplication: "Stop blaming external circumstances for your unhappiness. Take charge of your internal dialogue. If your mind says 'I can't', challenge it. Cultivate positive self-talk to be your own ally.",
    tags: ["Self-Control", "Mind", "Responsibility"]
  },
  {
    id: 4,
    chapter: 2,
    verse: 14,
    sanskrit: "मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः।\nआगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत॥",
    transliteration: "mātrā-sparśās tu kaunteya śītoṣṇa-sukha-duḥkha-dāḥ\nāgamāpāyino ’nityās tāṁs titikṣasva bhārata",
    translation: "O son of Kunti, the nonpermanent appearance of happiness and distress, and their disappearance in due course, are like the appearance and disappearance of winter and summer seasons. They arise from sense perception, and one must learn to tolerate them without being disturbed.",
    coreTeaching: "Everything is temporary. Joy and sorrow come and go like seasons. Developing tolerance (titiksha) allows you to remain balanced regardless of external ups and downs.",
    practicalApplication: "When having a bad day, remind yourself: 'This too shall pass.' When having a great day, enjoy it but don't cling to it. This emotional stability is a superpower in leadership and parenting.",
    tags: ["Knowledge", "Resilience", "Balance"]
  },
  {
    id: 5,
    chapter: 6,
    verse: 26,
    sanskrit: "यतो यतो निश्चलति मनश्चञ्चलमस्थिरम्।\nततस्ततो नियम्यैतदात्मन्येव वशं नयेत्॥",
    transliteration: "yato yato niścalati manaś cañcalam asthiram\ntatas tato niyamyaitad ātmany eva vaśaṁ nayet",
    translation: "From wherever the mind wanders due to its flickering and unsteady nature, one must certainly withdraw it and bring it back under the control of the self.",
    coreTeaching: "Meditation and focus require constant vigilance. It is natural for the mind to wander; the discipline lies in gently bringing it back every time it drifts.",
    practicalApplication: "Use this in deep work or study. When you catch yourself scrolling social media instead of working, don't judge yourself harshly. Just notice it and gently return your focus to the task. Repeat as needed.",
    tags: ["Meditation", "Focus", "Discipline"]
  },
  {
    id: 6,
    chapter: 18,
    verse: 66,
    sanskrit: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।\nअहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥",
    transliteration: "sarva-dharmān parityajya mām ekaṁ śaraṇaṁ vraja\nahaṁ tvāṁ sarva-pāpebhyo mokṣayiṣyāmi mā śucaḥ",
    translation: "Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.",
    coreTeaching: "Ultimate liberation comes from total surrender to the Divine source, transcending complex rituals or social duties. Trusting in a higher power relieves the heavy burden of the ego.",
    practicalApplication: "When you have done your best and things still seem overwhelming, practice 'surrender'. Admit you cannot control everything and hand the burden over to the Universe/God. This releases deep-seated anxiety.",
    tags: ["Devotion", "Surrender", "Peace"]
  },
  {
    id: 7,
    chapter: 3,
    verse: 21,
    sanskrit: "यद्यदाचरति श्रेष्ठस्तत्तदेवेतरो जनः।\nस यत्प्रमाणं कुरुते लोकस्तदनुवर्तते॥",
    transliteration: "yad yad ācarati śreṣṭhas tat tad evetaro janaḥ\nsa yat pramāṇaṁ kurute lokas tad anuvartate",
    translation: "Whatever action a great man performs, common men follow. And whatever standards he sets by exemplary acts, all the world pursues.",
    coreTeaching: "Leadership is about example, not just instruction. People watch what you do more than they listen to what you say.",
    practicalApplication: "If you are a parent or manager, model the behavior you want to see. If you want your team to be punctual, be punctual. If you want your children to be kind, practice kindness visibly.",
    tags: ["Duty", "Leadership", "Influence"]
  },
  {
    id: 8,
    chapter: 4,
    verse: 34,
    sanskrit: "तद्विद्धि प्रणिपातेन परिप्रश्नेन सेवया।\nउपदेक्ष्यन्ति ते ज्ञानं ज्ञानिनस्तत्त्वदर्शिनः॥",
    transliteration: "tad viddhi praṇipātena paripraśnena sevayā\nupadekṣyanti te jñānaṁ jñāninas tattva-darśinaḥ",
    translation: "Just try to learn the truth by approaching a spiritual master. Inquire from him submissively and render service unto him. The self-realized souls can impart knowledge unto you because they have seen the truth.",
    coreTeaching: "Knowledge is best acquired through humility, inquiry, and service to a mentor. We cannot learn everything by ourselves.",
    practicalApplication: "Find mentors in your field. Approach them with genuine curiosity and a willingness to help them, rather than just asking for favors. Humility opens the doors to wisdom.",
    tags: ["Knowledge", "Mentorship", "Learning"]
  },
  {
    id: 9,
    chapter: 2,
    verse: 62,
    sanskrit: "ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते।\nसङ्गात्सञ्जायते कामः कामात्क्रोधोऽभिजायते॥",
    transliteration: "dhyāyato viṣayān puṁsaḥ saṅgas teṣūpajāyate\nsaṅgāt sañjāyate kāmaḥ kāmāt krodho ’bhijāyate",
    translation: "While contemplating the objects of the senses, a person develops attachment for them, and from such attachment lust develops, and from lust anger arises.",
    coreTeaching: "The chain of destruction starts with dwelling on temptations. Thoughts lead to attachment, attachment to desire, and unfulfilled desire to anger.",
    practicalApplication: "Guard your thoughts. If you find yourself obsessing over a gadget, a person, or a status symbol, break the cycle early. Distract yourself before the attachment becomes a craving that steals your peace.",
    tags: ["Self-Control", "Mind", "Anger"]
  },
  {
    id: 10,
    chapter: 12,
    verse: 13,
    sanskrit: "अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च।\nनिर्ममो निरहङ्कारः समदुःखसुखः क्षमी॥",
    transliteration: "adveṣṭā sarva-bhūtānāṁ maitraḥ karuṇa eva ca\nnirmamo nirahaṅkāraḥ sama-duḥkha-sukhaḥ kṣamī",
    translation: "One who is not envious but is a kind friend to all living entities, who does not think himself a proprietor and is free from false ego, who is equal in both happiness and distress, who is forgiving...",
    coreTeaching: "True spiritual growth manifests as kindness, lack of ego, and forgiveness. It is about character, not just ritual.",
    practicalApplication: "Practice active forgiveness today. Let go of a grudge. Treat a stranger with unexpected kindness. This expands your heart and dissolves the rigid ego.",
    tags: ["Devotion", "Character", "Compassion"]
  },
  {
    id: 11,
    chapter: 2,
    verse: 22,
    sanskrit: "वासांसि जीर्णानि यथा विहाय\nनवानि गृह्णाति नरोऽपराणि।\nतथा शरीराणि विहाय जीर्णा-\nन्यन्यानि संयाति नवानि देही॥",
    transliteration: "vāsāṁsi jīrṇāni yathā vihāya\nnavāni gṛhṇāti naro ’parāṇi\ntathā śarīrāṇi vihāya jīrṇā-\nny anyāni saṁyāti navāni dehī",
    translation: "As a person puts on new garments, giving up old ones, the soul similarly accepts new material bodies, giving up the old and useless ones.",
    coreTeaching: "Death is merely a change of clothes for the soul. It acts as a comforting metaphor for the continuity of existence and the transient nature of the physical body.",
    practicalApplication: "View aging and physical changes with grace. Accept that the body changes, but the observer (you) remains the same. This perspective reduces the anxiety of aging.",
    tags: ["Knowledge", "Reincarnation", "Acceptance"]
  },
  {
    id: 12,
    chapter: 4,
    verse: 7,
    sanskrit: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥",
    transliteration: "yadā yadā hi dharmasya glānir bhavati bhārata\nabhyutthānam adharmasya tadātmānaṁ sṛjāmy aham",
    translation: "Whenever and wherever there is a decline in religious practice, O descendant of Bharata, and a predominant rise of irreligion—at that time I descend Myself.",
    coreTeaching: "The Divine intervenes when balance is lost. There is a cosmic order (Dharma) that sustains the universe, and forces exist to restore it when chaos prevails.",
    practicalApplication: "Trust in the balance of things. When you see injustice, do your part to correct it, knowing that truth eventually prevails. Do not lose hope in humanity.",
    tags: ["Knowledge", "Dharma", "Hope"]
  },
  {
    id: 13,
    chapter: 16,
    verse: 21,
    sanskrit: "त्रिविधं नरकस्येदं द्वारं नाशनमात्मनः।\nकामः क्रोधस्तथा लोभस्तस्मादेतत्त्रयं त्यजेत्॥",
    transliteration: "tri-vidhaṁ narakasyedaṁ dvāraṁ nāśanam ātmanaḥ\nkāmaḥ krodhas tathā lobhas tasmād etat trayaṁ tyajet",
    translation: "There are three gates leading to this hell—lust, anger and greed. Every sane man should give these up, for they lead to the degradation of the soul.",
    coreTeaching: "Lust, anger, and greed are the root causes of self-destruction. Recognizing and avoiding these three traps is essential for mental sanity and peace.",
    practicalApplication: "Perform a daily check: Did I act out of greed today? Was I driven by anger? Acknowledging these impulses is the first step to controlling them.",
    tags: ["Self-Control", "Ethics", "Vice"]
  },
  {
    id: 14,
    chapter: 6,
    verse: 17,
    sanskrit: "युक्ताहारविहारस्य युक्तचेष्टस्य कर्मसु।\nयुक्तस्वप्नावबोधस्य योगो भवति दुःखहा॥",
    transliteration: "yuktāhāra-vihārasya yukta-ceṣṭasya karmasu\nyukta-svapnāvabodhasya yogo bhavati duḥkha-hā",
    translation: "He who is regulated in his habits of eating, sleeping, recreation and work can mitigate all material pains by practicing the yoga system.",
    coreTeaching: "Balance (moderation) is the key to a happy life. Extremes in anything—eating too much or too little, sleeping too much or too little—cause pain.",
    practicalApplication: "Evaluate your lifestyle. Are you working too hard? Sleeping enough? Creating a balanced routine is a spiritual practice that eliminates misery.",
    tags: ["Meditation", "Lifestyle", "Balance"]
  },
  {
    id: 15,
    chapter: 12,
    verse: 15,
    sanskrit: "यस्मान्नोद्विजते लोको लोकान्नोद्विजते च यः।\nहर्षामर्षभयोद्वेगैर्मुक्तो यः स च मे प्रियः॥",
    transliteration: "yasmān nodvijate loko lokān nodvijate ca yaḥ\nharṣāmarṣa-bhayodvegair mukto yaḥ sa ca me priyaḥ",
    translation: "He for whom no one is put into difficulty and who is not disturbed by anyone, who is equipoised in happiness and distress, fear and anxiety, is very dear to Me.",
    coreTeaching: "A true spiritual person is a source of peace for others and is not easily disturbed by others. Emotional independence and harmlessness are signs of divine love.",
    practicalApplication: "Strive to be a person who doesn't cause anxiety to others. Be the calm presence in a chaotic meeting or a stressed family. This makes you a source of light.",
    tags: ["Devotion", "Peace", "Relationships"]
  },
  {
    id: 16,
    chapter: 9,
    verse: 22,
    sanskrit: "अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते।\nतेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥",
    transliteration: "ananyāś cintayanto māṁ ye janāḥ paryupāsate\nteṣāṁ nityābhiyuktānāṁ yoga-kṣemaṁ vahāmy aham",
    translation: "But those who always worship Me with exclusive devotion, meditating on My transcendental form—to them I carry what they lack, and I preserve what they have.",
    coreTeaching: "When you are completely dedicated to your higher purpose/Divine, the universe supports you. It takes care of your needs and protects your assets.",
    practicalApplication: "Trust that if you follow your true path with dedication, the resources you need will appear. Do not operate from a mindset of scarcity.",
    tags: ["Devotion", "Faith", "Protection"]
  },
  {
    id: 17,
    chapter: 10,
    verse: 41,
    sanskrit: "यद्यद्विभूतिमत्सत्त्वं श्रीमदूर्जितमेव वा।\nतत्तदेवावगच्छ त्वं मम तेजोंशसम्भवम्॥",
    transliteration: "yad yad vibhūtimat sattvaṁ śrīmad ūrjitam eva vā\ntat tad evāvagaccha tvaṁ mama tejo-’ṁśa-sambhavam",
    translation: "Know that all opulent, beautiful and glorious creations spring from but a spark of My splendor.",
    coreTeaching: "All greatness, beauty, and power in the world is a reflection of the Divine. Seeing the divine in excellence fosters humility and appreciation.",
    practicalApplication: "When you see an amazing artist, a great leader, or beautiful nature, appreciate it as a glimpse of the Divine. This transforms envy into admiration.",
    tags: ["Knowledge", "Beauty", "Divinity"]
  },
  {
    id: 18,
    chapter: 3,
    verse: 35,
    sanskrit: "श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्।\nस्वधर्मे निधनं श्रेयः परधर्मो भयावहः॥",
    transliteration: "śreyān sva-dharmo viguṇaḥ para-dharmāt sv-anuṣṭhitāt\nsva-dharme nidhanaṁ śreyaḥ para-dharmo bhayāvahaḥ",
    translation: "It is far better to discharge one's prescribed duties, even though faultily, than another's duties perfectly. Destruction in the course of performing one's own duty is better than engaging in another's duty, for to follow another's path is dangerous.",
    coreTeaching: "Authenticity is better than perfection in imitation. Do what you are meant to do (your Swadharma), even if it's hard, rather than copying someone else's path.",
    practicalApplication: "Don't choose a career or life path just because it looks good on someone else. Find what resonates with your nature and stick to it, even if you struggle initially.",
    tags: ["Duty", "Authenticity", "Career"]
  },
  {
    id: 19,
    chapter: 2,
    verse: 3,
    sanskrit: "क्लैब्यं मा स्म गमः पार्थ नैतत्त्वय्युपपद्यते।\nक्षुद्रं हृदयदौर्बल्यं त्यक्त्वोत्तिष्ठ परन्तप॥",
    transliteration: "klaibyaṁ mā sma gamaḥ pārtha naitat tvayy upapadyate\nkṣudraṁ hṛdaya-daurbalyaṁ tyaktvottiṣṭha parantapa",
    translation: "O son of Pritha, do not yield to this degrading impotence. It does not become you. Give up such petty weakness of heart and arise, O chastiser of the enemy.",
    coreTeaching: "Courage is required to face life's battles. Giving in to weakness, self-pity, or despair is not worthy of your potential.",
    practicalApplication: "When you feel like giving up or running away from a difficult situation, tell yourself 'Stand up!' Confronting your challenges is the only way to overcome them.",
    tags: ["Duty", "Courage", "Action"]
  },
  {
    id: 20,
    chapter: 5,
    verse: 18,
    sanskrit: "विद्याविनयसम्पन्ने ब्राह्मणे गवि हस्तिनि।\nशुनि चैव श्वपाके च पण्डिताः समदर्शिनः॥",
    transliteration: "vidyā-vinaya-sampanne brāhmaṇe gavi hastini\nśuni caiva śva-pāke ca paṇḍitāḥ sama-darśinaḥ",
    translation: "The humble sages, by virtue of true knowledge, see with equal vision a learned and gentle brahmana, a cow, an elephant, a dog and a dog-eater.",
    coreTeaching: "True knowledge leads to equal vision. A wise person sees the same soul in every being, regardless of their outer appearance or status.",
    practicalApplication: "Practice treating everyone with equal respect—from the CEO to the janitor, and even animals. Overcome your biases based on appearance or social standing.",
    tags: ["Knowledge", "Equality", "Compassion"]
  },
  {
    id: 21,
    chapter: 13,
    verse: 2,
    sanskrit: "इदं शरीरं कौन्तेय क्षेत्रमित्यभिधीयते।\nएतद्यो वेत्ति तं प्राहुः क्षेत्रज्ञ इति तद्विदः॥",
    transliteration: "idaṁ śarīraṁ kaunteya kṣetram ity abhidhīyate\netad yo vetti taṁ prāhuḥ kṣetrajña iti tad-vidaḥ",
    translation: "O son of Kunti, this body is also called the field, and one who knows this body is called the knower of the field.",
    coreTeaching: "Distinguish between the observer (you) and the observed (the body/mind). You are the consciousness knowing the field of activity, not the field itself.",
    practicalApplication: "When you feel pain or emotion, observe it: 'I am aware of this pain' rather than 'I am in pain'. This slight detachment reduces suffering.",
    tags: ["Knowledge", "Consciousness", "Self"]
  }
];

export const CATEGORIES: Record<string, string[]> = {
  Duty: ['Duty', 'Work', 'Leadership', 'Action', 'Dharma', 'Career', 'Authenticity'],
  Devotion: ['Devotion', 'Surrender', 'Love', 'Faith', 'Compassion', 'Protection', 'Peace', 'Beauty'],
  Knowledge: ['Knowledge', 'Self', 'Truth', 'Resilience', 'Reincarnation', 'Hope', 'Consciousness', 'Equality', 'Divinity'],
  Meditation: ['Meditation', 'Focus', 'Mind', 'Peace', 'Lifestyle', 'Balance'],
  "Self-Control": ['Self-Control', 'Discipline', 'Anger', 'Senses', 'Ethics', 'Vice', 'Responsibility']
};
