import type { BloodGroup, DonationType, StoryType } from "@/lib/constants";
import type { Locale } from "@/i18n/config";

/**
 * Placeholder stories and testimonials, shown while there are no real ones.
 *
 * Every item is marked "Sample" wherever it appears, and sample story pages are
 * not indexed by search engines. Stories switch off by themselves once a real
 * story is published; testimonials stay until they are replaced here. To hide
 * every sample at once, set SHOW_SAMPLES to false.
 *
 * Names, places and events are invented. Replace them only with real
 * experiences shared with consent.
 */
export const SHOW_SAMPLES = true;

type Text = Record<Locale, string>;

export interface SampleTestimonial {
  quote: Text;
  name: string;
  role: Text;
  city: string;
}

export const SAMPLE_TESTIMONIALS: SampleTestimonial[] = [
  {
    quote: {
      en: "Signing up took two minutes. When a verified request for my blood group came up nearby, a Rakt Mitra called, explained everything and let me decide.",
      hi: "साइन अप करने में बस दो मिनट लगे। जब पास में मेरे ब्लड ग्रुप की एक जाँची हुई रिक्वेस्ट आई, तो एक वॉलंटियर ने फ़ोन किया, सब कुछ समझाया और फ़ैसला मुझ पर छोड़ा।",
    },
    name: "Neha K.",
    role: { en: "Donor", hi: "डोनर" },
    city: "Jaipur",
  },
  {
    quote: {
      en: "It was 2 a.m. and we didn't know whom to call. A Rakt Mitra checked our request with the hospital and helped us reach donors who had agreed to be contacted.",
      hi: "रात के 2 बजे थे और हमें समझ नहीं आ रहा था कि किसे फ़ोन करें। एक वॉलंटियर ने अस्पताल से हमारी रिक्वेस्ट की पुष्टि की और उन डोनरों तक पहुँचने में मदद की जिन्होंने संपर्क के लिए हाँ कहा था।",
    },
    name: "Rahul M.",
    role: { en: "Patient's family", hi: "मरीज़ का परिवार" },
    city: "Lucknow",
  },
  {
    quote: {
      en: "We check every request with the hospital first. Only then can the family call donors who can give right now.",
      hi: "हम पहले हर रिक्वेस्ट की अस्पताल से जाँच करते हैं। उसके बाद ही परिवार उन डोनरों को फ़ोन कर पाता है जो अभी रक्तदान कर सकते हैं।",
    },
    name: "Farhan A.",
    role: { en: "Rakt Mitra", hi: "वॉलंटियर" },
    city: "Pune",
  },
];

export interface SampleStory {
  /** Served at /stories/sample/<slug>. */
  slug: string;
  story_type: StoryType;
  title: Text;
  excerpt: Text;
  /** Paragraphs separated by a blank line. */
  body: Text;
  display_name: string;
  city: string;
  blood_group: BloodGroup | null;
  donation_type: DonationType | null;
}

export const SAMPLE_STORIES: SampleStory[] = [
  {
    slug: "the-call-i-almost-missed",
    story_type: "donor",
    display_name: "Neha K.",
    city: "Jaipur",
    blood_group: "B+",
    donation_type: "sdp",
    title: { en: "The call I almost didn't answer", hi: "वो कॉल जिसे मैं लगभग नहीं उठाने वाली थी" },
    excerpt: {
      en: "An unknown number during a work meeting turned out to be a Rakt Mitra with a verified platelet request near my home.",
      hi: "ऑफ़िस मीटिंग के बीच आया एक अनजान नंबर — फ़ोन एक वॉलंटियर का था, मेरे घर के पास प्लेटलेट्स की एक जाँची हुई रिक्वेस्ट के लिए।",
    },
    body: {
      en: `I registered on Rakt Response after a friend's father needed platelets last year. I chose to be contacted only for verified requests, by phone, and then honestly forgot about it.

Months later an unknown number rang during a meeting. I nearly let it go. It was a Rakt Mitra who said a hospital ten minutes from my home had a verified request for SDP, and asked whether I was free and willing. She was clear that saying no was completely fine.

I went that evening. The blood centre did its own checks before the donation, and the session took longer than whole blood, so I was glad she had told me to keep a few hours free.

What stayed with me is that my number was never posted anywhere. I was asked, I decided, and the Rakt Mitra called the next day only to say thank you.`,
      hi: `पिछले साल एक दोस्त के पिताजी को प्लेटलेट्स की ज़रूरत पड़ी थी, उसके बाद मैंने Rakt Response पर रजिस्टर किया। मैंने चुना कि मुझसे सिर्फ़ जाँची हुई रिक्वेस्ट के लिए, फ़ोन पर संपर्क किया जाए — और फिर सच कहूँ तो मैं भूल ही गई।

कई महीने बाद एक मीटिंग के बीच एक अनजान नंबर से फ़ोन आया। मैं लगभग काटने वाली थी। वो एक वॉलंटियर थीं। उन्होंने बताया कि मेरे घर से दस मिनट दूर एक अस्पताल में SDP की एक जाँची हुई रिक्वेस्ट है, और पूछा कि क्या मैं आ सकती हूँ और आना चाहती हूँ। उन्होंने साफ़ कहा कि मना करना भी बिल्कुल ठीक है।

मैं उसी शाम गई। डोनेशन से पहले ब्लड सेंटर ने अपनी जाँच की, और यह सेशन होल ब्लड से लंबा चला — अच्छा हुआ कि उन्होंने पहले ही कुछ घंटे खाली रखने को कह दिया था।

जो बात मेरे मन में रह गई, वो यह कि मेरा नंबर कहीं भी सबके सामने नहीं डाला गया। मुझसे पूछा गया, फ़ैसला मैंने किया, और अगले दिन वॉलंटियर ने सिर्फ़ धन्यवाद कहने के लिए फ़ोन किया।`,
    },
  },
  {
    slug: "two-nights-at-the-hospital",
    story_type: "attendant",
    display_name: "Rahul M.",
    city: "Lucknow",
    blood_group: null,
    donation_type: "sdp",
    title: { en: "Two nights at the hospital, and one form that helped", hi: "अस्पताल की दो रातें, और एक फ़ॉर्म जिसने मदद की" },
    excerpt: {
      en: "My father's platelet count kept falling during dengue. Once we submitted a request, we were no longer making calls alone.",
      hi: "डेंगू में पापा के प्लेटलेट्स लगातार गिर रहे थे। रिक्वेस्ट भेजने के बाद हमें अकेले फ़ोन नहीं करने पड़े।",
    },
    body: {
      en: `When my father was admitted with dengue, the doctors told us his platelet count was falling and that he might need platelets. We started calling everyone we knew. By midnight we were exhausted and getting nowhere.

A cousin sent me the Rakt Response request form. It asked for the hospital, the blood group and what was needed, and it said clearly that a Rakt Mitra would check the request before sharing it with anyone.

The Rakt Mitra called the hospital first, then called me. Over the next day, two donors who had agreed to be contacted reached the blood centre. The doctors decided everything about my father's treatment; the platform only helped us find people willing to help.

He is home now. I wrote this because I wish we had known about it on the first night, not the second.`,
      hi: `जब पापा डेंगू के साथ भर्ती हुए, डॉक्टरों ने बताया कि उनके प्लेटलेट्स गिर रहे हैं और प्लेटलेट्स चढ़ाने पड़ सकते हैं। हमने हर जानने वाले को फ़ोन करना शुरू किया। आधी रात तक हम थक चुके थे और कुछ हाथ नहीं लगा था।

एक कज़िन ने मुझे Rakt Response का रिक्वेस्ट फ़ॉर्म भेजा। उसमें अस्पताल, ब्लड ग्रुप और ज़रूरत पूछी गई थी, और साफ़ लिखा था कि किसी से भी शेयर करने से पहले एक वॉलंटियर रिक्वेस्ट की जाँच करेगा।

वॉलंटियर ने पहले अस्पताल से बात की, फिर मुझे फ़ोन किया। अगले एक दिन में दो डोनर, जिन्होंने संपर्क के लिए हाँ कहा था, ब्लड सेंटर पहुँचे। पापा के इलाज का हर फ़ैसला डॉक्टरों ने लिया; प्लैटफ़ॉर्म ने बस मदद करने को तैयार लोगों तक पहुँचाया।

पापा अब घर पर हैं। यह इसलिए लिख रहा हूँ क्योंकि काश हमें इसके बारे में पहली रात ही पता होता, दूसरी नहीं।`,
    },
  },
  {
    slug: "verifying-my-first-request",
    story_type: "volunteer",
    display_name: "Farhan A.",
    city: "Pune",
    blood_group: null,
    donation_type: null,
    title: { en: "What I learned verifying my first request", hi: "पहली रिक्वेस्ट की जाँच करके मैंने क्या सीखा" },
    excerpt: {
      en: "Before anyone is contacted, a Rakt Mitra confirms the request with the hospital. My first one taught me why that step matters.",
      hi: "किसी से संपर्क से पहले वॉलंटियर अस्पताल से रिक्वेस्ट की पुष्टि करता है। मेरी पहली रिक्वेस्ट ने सिखाया कि यह क्यों ज़रूरी है।",
    },
    body: {
      en: `I joined as a Rakt Mitra thinking the job was mostly about finding donors quickly. My first request taught me that the most important step comes before that.

The request said "urgent, four units". When I called the hospital, the blood bank had already arranged two units and needed donors only for the rest, and only the next morning. Without that call, we would have woken up donors in the middle of the night for nothing.

Now I check every request the same way: confirm it with the hospital or the requester, and only then mark it verified. That is the moment the family can see donors who can give right now, so it has to be right.

It takes a few minutes longer, and it is the reason donors keep picking up our calls.`,
      hi: `मैं वॉलंटियर बना तो सोचा था कि काम बस जल्दी से डोनर ढूँढना है। पहली ही रिक्वेस्ट ने सिखाया कि सबसे ज़रूरी कदम उससे पहले आता है।

रिक्वेस्ट में लिखा था "अर्जेंट, चार यूनिट"। जब मैंने अस्पताल फ़ोन किया, तो पता चला कि ब्लड बैंक दो यूनिट का इंतज़ाम कर चुका था, बाकी के लिए डोनर चाहिए थे, और वो भी अगली सुबह। वो फ़ोन न करता, तो हम आधी रात को डोनरों को बेवजह जगा देते।

अब मैं हर रिक्वेस्ट ऐसे ही जाँचता हूँ: अस्पताल या रिक्वेस्ट करने वाले से पुष्टि, और उसके बाद ही उसे वेरिफ़ाइड मार्क करना। उसी पल परिवार को वे डोनर दिखते हैं जो अभी रक्तदान कर सकते हैं, इसलिए यह सही होना चाहिए।

इसमें कुछ मिनट ज़्यादा लगते हैं, और इसी वजह से डोनर हमारा फ़ोन उठाते रहते हैं।`,
    },
  },
  {
    slug: "the-donors-i-will-never-meet",
    story_type: "recipient",
    display_name: "Kavya R.",
    city: "Ahmedabad",
    blood_group: null,
    donation_type: "whole_blood",
    title: { en: "Thalassaemia, and the donors I'll never meet", hi: "थैलेसीमिया, और वो डोनर जिनसे मैं कभी नहीं मिलूँगी" },
    excerpt: {
      en: "I've needed regular transfusions since I was a child. Every unit came from a stranger who chose to give.",
      hi: "बचपन से मुझे नियमित रूप से खून चढ़वाना पड़ता है। हर यूनिट किसी अनजान इंसान ने अपनी मर्ज़ी से दी।",
    },
    body: {
      en: `I have thalassaemia and have needed regular transfusions for as long as I can remember. My parents used to keep a notebook of people who might donate, and every month the list got shorter.

What changed for us was not one dramatic day but steadiness: donors who register, keep their details up to date and say yes when they can. Hospitals and blood banks do the matching and the testing; what they need is people who keep turning up.

I will never meet most of the people whose blood I have received. If you are one of them, or might become one, thank you. An ordinary week in my life would not be possible without you.`,
      hi: `मुझे थैलेसीमिया है और जब से मुझे याद है, मुझे नियमित रूप से खून चढ़वाना पड़ता है। मेरे माता-पिता एक डायरी रखते थे उन लोगों की जो शायद डोनेट करें, और हर महीने वो लिस्ट छोटी होती जाती थी।

हमारे लिए जो बदला वो कोई एक बड़ा दिन नहीं था, बल्कि भरोसा था: ऐसे डोनर जो रजिस्टर करते हैं, अपनी जानकारी अपडेट रखते हैं और जब हो सके हाँ कहते हैं। मिलान और जाँच अस्पताल और ब्लड बैंक करते हैं; उन्हें बस ऐसे लोग चाहिए जो बार-बार आते रहें।

जिनका खून मुझे मिला है, उनमें से ज़्यादातर से मैं कभी नहीं मिलूँगी। अगर आप उनमें से एक हैं, या बन सकते हैं — धन्यवाद। मेरी ज़िंदगी का एक आम हफ़्ता आपके बिना मुमकिन नहीं होता।`,
    },
  },
  {
    slug: "a-sunday-camp-at-our-hall",
    story_type: "camp",
    display_name: "Arjun P.",
    city: "Bhopal",
    blood_group: null,
    donation_type: "whole_blood",
    title: { en: "A Sunday camp at our community hall", hi: "हमारे कम्युनिटी हॉल में एक रविवार का कैंप" },
    excerpt: {
      en: "Our residents' association hosted its first donation camp with a licensed blood bank. Here's what we'd tell anyone planning one.",
      hi: "हमारी रेज़िडेंट्स एसोसिएशन ने एक लाइसेंस वाले ब्लड बैंक के साथ पहला डोनेशन कैंप लगाया। कैंप की योजना बनाने वालों के लिए हमारी कुछ बातें।",
    },
    body: {
      en: `Our residents' association had talked about a donation camp for years. This year we finally partnered with a licensed blood bank, which ran the screening, the collection and the paperwork. We arranged the hall, chairs, water and snacks.

Registering donors on Rakt Response beforehand helped us plan: we knew roughly how many people to expect, and donors were reminded to eat well and carry an ID.

Some people who came were not able to donate that day, and the blood bank's staff handled that kindly. Others were first-time donors who arrived nervous and left smiling.

If you are planning a camp, start with a licensed blood bank, keep it simple and give people time. The rest follows.`,
      hi: `हमारी रेज़िडेंट्स एसोसिएशन सालों से डोनेशन कैंप की बात करती आ रही थी। इस साल आख़िरकार हमने एक लाइसेंस वाले ब्लड बैंक के साथ मिलकर कैंप लगाया — स्क्रीनिंग, ब्लड लेना और काग़ज़ी काम उन्होंने संभाला। हॉल, कुर्सियाँ, पानी और नाश्ते का इंतज़ाम हमने किया।

पहले से डोनरों को Rakt Response पर रजिस्टर करवाने से योजना बनाना आसान हुआ: हमें अंदाज़ा था कि कितने लोग आएँगे, और डोनरों को अच्छा खाना खाने और पहचान पत्र साथ लाने की याद दिलाई गई।

कुछ लोग उस दिन डोनेट नहीं कर पाए, और ब्लड बैंक के स्टाफ़ ने यह बात बहुत प्यार से संभाली। कुछ पहली बार डोनेट करने वाले थे — घबराए हुए आए और मुस्कुराते हुए गए।

अगर आप कैंप की योजना बना रहे हैं, तो किसी लाइसेंस वाले ब्लड बैंक से शुरुआत करें, सब कुछ सरल रखें और लोगों को समय दें। बाकी अपने आप हो जाता है।`,
    },
  },
  {
    slug: "my-first-donation-at-eighteen",
    story_type: "donor",
    display_name: "Ananya S.",
    city: "Indore",
    blood_group: "O+",
    donation_type: "whole_blood",
    title: { en: "My first donation, the week I turned 18", hi: "मेरा पहला डोनेशन, 18 की होते ही" },
    excerpt: {
      en: "I was nervous about the needle. Knowing what to expect, step by step, made the whole visit feel easy.",
      hi: "मुझे सुई से डर लगता था। क्या-क्या होगा, यह पहले से जानने से पूरा अनुभव आसान लगा।",
    },
    body: {
      en: `I had wanted to donate since school, when a teacher needed blood after an accident. The week I turned 18, I registered and read the guides on what to eat and what happens at the centre.

On the day I had a proper breakfast and plenty of water, and carried my ID. The staff asked the screening questions, checked my haemoglobin and blood pressure, and explained everything before they started. The needle was quicker than I expected.

Afterwards I rested, had the juice and biscuits they offered, and took it easy for the rest of the day. I've noted the date in my profile so I know when I can think about donating again; the blood centre will decide on the day.`,
      hi: `स्कूल के दिनों से मैं डोनेट करना चाहती थी, जब एक टीचर को एक्सीडेंट के बाद खून की ज़रूरत पड़ी थी। जिस हफ़्ते मैं 18 की हुई, मैंने रजिस्टर किया और पढ़ा कि क्या खाना है और सेंटर पर क्या होता है।

उस दिन मैंने अच्छा नाश्ता किया, खूब पानी पिया और पहचान पत्र साथ ले गई। स्टाफ़ ने स्क्रीनिंग के सवाल पूछे, हीमोग्लोबिन और ब्लड प्रेशर जाँचा, और शुरू करने से पहले सब कुछ समझाया। सुई उम्मीद से जल्दी हो गई।

बाद में मैंने आराम किया, उन्होंने जो जूस और बिस्किट दिए वो लिए, और बाकी दिन हल्का रखा। मैंने अपनी प्रोफ़ाइल में तारीख़ दर्ज कर ली है ताकि पता रहे कि अगली बार कब सोच सकती हूँ; फ़ैसला उस दिन ब्लड सेंटर ही करेगा।`,
    },
  },
];

/** The three samples shown on the homepage: a donor, a family and a volunteer. */
export const HOME_SAMPLE_SLUGS = ["the-call-i-almost-missed", "two-nights-at-the-hospital", "verifying-my-first-request"];

export function findSampleStory(slug: string): SampleStory | undefined {
  return SAMPLE_STORIES.find((story) => story.slug === slug);
}
