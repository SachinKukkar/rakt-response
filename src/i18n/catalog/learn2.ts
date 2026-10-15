import type { Catalog } from "./types";

/** English UI text → Hindi. Keep the English key exactly as written in the code. */
const hi: Catalog = {
  // --- Shared on these pages ------------------------------------------------------
  "general eligibility info": "योग्यता की आम जानकारी",
  "privacy policy": "प्राइवेसी नीति",

  // --- Donation types (src/app/(site)/donation-types/page.tsx) ----------------------
  "Donation types": "रक्तदान के प्रकार",
  "Whole blood, Single Donor Platelet (SDP) and other apheresis donations explained: how they differ, how long they take, and why they are not interchangeable.":
    "होल ब्लड, सिंगल डोनर प्लेटलेट (SDP) और दूसरे एफ़ेरेसिस रक्तदान की आसान जानकारी: इनमें क्या फ़र्क है, कितना समय लगता है, और एक की जगह दूसरा क्यों नहीं चल सकता।",
  "The classic. Most donors start here.": "सबसे आम तरीका। ज़्यादातर डोनर यहीं से शुरू करते हैं।",
  "SDP (Single Donor Platelets)": "SDP (एक डोनर से प्लेटलेट्स)",
  "Platelets only. A machine returns the rest to you.": "सिर्फ़ प्लेटलेट्स। बाकी खून मशीन आपको वापस लौटा देती है।",
  "One component, such as plasma. Only at some centres.": "खून का एक हिस्सा, जैसे प्लाज़्मा। सिर्फ़ कुछ ब्लड बैंक में होता है।",
  Time: "समय",
  How: "कैसे",
  Helps: "मदद",
  "~10–15 min collection": "खून लेने में ~10–15 मिनट",
  "One needle, one sterile bag": "एक सुई, एक स्टेराइल (कीटाणु-रहित) बैग",
  "Split into red cells, plasma, sometimes platelets": "रेड सेल्स, प्लाज़्मा और कभी-कभी प्लेटलेट्स में बाँटा जाता है",
  "~60–90+ min on the machine": "मशीन पर ~60–90+ मिनट",
  "Cell separator keeps platelets": "सेल सेपरेटर मशीन प्लेटलेट्स रख लेती है",
  "Often patients with very low platelets": "अक्सर उन मरीज़ों के लिए जिनके प्लेटलेट्स बहुत कम हैं",
  "Longer than whole blood": "होल ब्लड से ज़्यादा",
  "Machine collects one component": "मशीन खून का एक हिस्सा लेती है",
  "A specific need, e.g. plasma": "किसी खास ज़रूरत के लिए, जैसे प्लाज़्मा",
  "Different gaps": "बीच का अंतर अलग-अलग",
  "Red cells take weeks to rebuild, so whole blood needs the longest gap.":
    "रेड सेल्स को दोबारा बनने में कई हफ़्ते लगते हैं, इसलिए होल ब्लड के बाद सबसे लंबा अंतर चाहिए।",
  "Intervals": "अंतर",
  "Extra checks for SDP": "SDP के लिए ज़्यादा जाँच",
  "Usually a platelet count and a vein check. The centre decides.": "आमतौर पर प्लेटलेट काउंट और नसों की जाँच। फ़ैसला ब्लड बैंक करता है।",
  "Screening": "जाँच",
  "Block your time": "समय निकालकर रखें",
  "Saying yes to SDP? Keep a few hours free.": "SDP के लिए हाँ कह रहे हैं? कुछ घंटे खाली रखें।",
  "Plan": "प्लान",
  "Whole blood vs": "होल ब्लड या",
  "Same you, different ways to give. Here's the quick compare.": "आप वही, देने के तरीके अलग। यहाँ जल्दी से फ़र्क देखें।",
  "Apheresis": "एफ़ेरेसिस",
  "Whole blood: one bag, split into parts later at the blood centre.":
    "होल ब्लड: एक बैग, जिसे बाद में ब्लड बैंक में अलग-अलग हिस्सों में बाँटा जाता है।",
  "SDP: a machine keeps your platelets and gives the rest back.": "SDP: मशीन आपके प्लेटलेट्स रख लेती है और बाकी खून वापस कर देती है।",
  "SDP takes much longer and needs extra checks.": "SDP में बहुत ज़्यादा समय लगता है और ज़्यादा जाँच होती है।",
  "They're not interchangeable. Always check which type a request needs.":
    "एक की जगह दूसरा नहीं चलता। हमेशा देखें कि रिक्वेस्ट में किस प्रकार की ज़रूरत है।",
  "Not interchangeable": "एक की जगह दूसरा नहीं चलता",
  "A whole-blood donation can't meet an SDP request, and a whole-blood request isn't a platelet request. Check the type before you respond.":
    "होल ब्लड रक्तदान से SDP रिक्वेस्ट पूरी नहीं होती, और होल ब्लड की रिक्वेस्ट प्लेटलेट की रिक्वेस्ट नहीं है। जवाब देने से पहले प्रकार देख लें।",
  "Side by side": "आमने-सामने",
  "Pick your type": "अपना प्रकार चुनें",
  "Rough guide only. Exact times, amounts and gaps depend on the centre and national guidelines.":
    "यह सिर्फ़ मोटा अंदाज़ा है। सही समय, मात्रा और अंतर ब्लड बैंक और राष्ट्रीय गाइडलाइन पर निर्भर करते हैं।",
  "Good to know": "जानने लायक",
  "Before you say yes": "हाँ कहने से पहले",
  "How whole blood and apheresis differ": "होल ब्लड और एफ़ेरेसिस में क्या फ़र्क है",
  "In a {term}, blood flows through one needle into a sterile, single-use bag, typically around 350–450 ml depending on the bag used and your weight. It is usually separated at the blood centre into red cells, plasma and sometimes platelets.":
    "{term} में, खून एक सुई से एक स्टेराइल बैग में जाता है, जो सिर्फ़ एक बार इस्तेमाल होता है। आमतौर पर लगभग 350–450 ml खून लिया जाता है, जो बैग और आपके वज़न पर निर्भर करता है। ब्लड बैंक में आमतौर पर इसे रेड सेल्स, प्लाज़्मा और कभी-कभी प्लेटलेट्स में अलग किया जाता है।",
  "whole-blood donation": "होल ब्लड रक्तदान",
  "In an {term}, a machine separates your blood during the donation, keeps one component (such as platelets or plasma) and returns the rest to you through the same or a second needle. Because it collects a larger amount of one component from a single person, one SDP donation can provide a platelet dose that would otherwise need to be pooled from several whole-blood donations. This can mean fewer donor exposures for the patient.":
    "{term} में, रक्तदान के दौरान मशीन आपके खून को अलग करती है, एक हिस्सा (जैसे प्लेटलेट्स या प्लाज़्मा) रख लेती है और बाकी खून उसी सुई या दूसरी सुई से आपको वापस कर देती है। इसमें एक ही व्यक्ति से एक हिस्से की ज़्यादा मात्रा ली जाती है, इसलिए एक SDP रक्तदान से प्लेटलेट्स की उतनी खुराक मिल सकती है, जिसके लिए वरना कई होल ब्लड रक्तदान को मिलाना पड़ता। इसका मतलब हो सकता है कि मरीज़ को कम डोनरों का खून लेना पड़े।",
  "apheresis donation": "एफ़ेरेसिस रक्तदान",
  "Intervals and extra checks": "रक्तदान के बीच का अंतर और ज़्यादा जाँच",
  "Your body replaces components at different speeds. Red cells take weeks to rebuild, so whole-blood donations have the longest interval. Platelets and plasma are replaced faster, so apheresis intervals are shorter, within limits set by the centre and national guidelines.":
    "आपका शरीर खून के अलग-अलग हिस्सों को अलग-अलग रफ़्तार से दोबारा बनाता है। रेड सेल्स को दोबारा बनने में कई हफ़्ते लगते हैं, इसलिए होल ब्लड रक्तदान के बीच सबसे लंबा अंतर होता है। प्लेटलेट्स और प्लाज़्मा जल्दी बन जाते हैं, इसलिए एफ़ेरेसिस के बीच अंतर कम होता है, पर ब्लड बैंक और राष्ट्रीय गाइडलाइन की तय सीमा के अंदर।",
  "Whole blood involves standard screening: questionnaire, haemoglobin, weight, pulse, blood pressure and temperature. Apheresis centres usually also check your platelet count and whether your veins suit the machine. Some people who can give whole blood may not be suitable for SDP, and the apheresis centre makes that decision. Other apheresis donations may need additional tests depending on the component.":
    "होल ब्लड में सामान्य जाँच होती है: सवालों की सूची, हीमोग्लोबिन, वज़न, नब्ज़, ब्लड प्रेशर और शरीर का तापमान। एफ़ेरेसिस सेंटर आमतौर पर आपका प्लेटलेट काउंट भी जाँचते हैं, और यह भी कि आपकी नसें मशीन के लिए ठीक हैं या नहीं। कुछ लोग जो होल ब्लड दे सकते हैं, शायद SDP के लिए ठीक न हों, और यह फ़ैसला एफ़ेरेसिस सेंटर करता है। दूसरे एफ़ेरेसिस रक्तदान में, खून के हिस्से के हिसाब से और जाँचें भी हो सकती हैं।",
  "General information, not medical advice. Rakt Response doesn't decide who can donate; the blood or apheresis centre's doctor does, every time. See {link}.":
    "यह आम जानकारी है, डॉक्टरी सलाह नहीं। कौन रक्तदान कर सकता है, यह Rakt Response तय नहीं करता; हर बार ब्लड बैंक या एफ़ेरेसिस सेंटर के डॉक्टर तय करते हैं। देखें: {link}।",
  "Every request on Rakt Response says which type it needs, and your history logs whole blood and SDP separately.":
    "Rakt Response पर हर रिक्वेस्ट में लिखा होता है कि किस प्रकार की ज़रूरत है, और आपके रिकॉर्ड में होल ब्लड और SDP अलग-अलग दर्ज होते हैं।",

  // --- Why donate (src/app/(site)/why-donate/page.tsx) ------------------------------
  "Why voluntary blood donation matters: how red cells, platelets and plasma support patients, and why regular voluntary donors are important.":
    "स्वैच्छिक रक्तदान क्यों ज़रूरी है: रेड सेल्स, प्लेटलेट्स और प्लाज़्मा मरीज़ों की कैसे मदद करते हैं, और नियमित स्वैच्छिक डोनर क्यों ज़रूरी हैं।",
  "Red cells": "रेड सेल्स (लाल कोशिकाएँ)",
  "Carry oxygen. Often used after injury, surgery, childbirth or severe anaemia.":
    "शरीर में ऑक्सीजन पहुँचाते हैं। अक्सर चोट, ऑपरेशन, डिलीवरी या गंभीर खून की कमी (एनीमिया) के बाद काम आते हैं।",
  "Oxygen": "ऑक्सीजन",
  Platelets: "प्लेटलेट्स",
  "Help blood clot. Often needed when counts drop, like in some cancer care or severe dengue.":
    "खून जमने में मदद करते हैं। अक्सर तब ज़रूरत होती है जब इनकी गिनती गिर जाए, जैसे कैंसर के कुछ इलाज में या गंभीर डेंगू में।",
  "Clotting": "खून जमना",
  Plasma: "प्लाज़्मा",
  "The liquid part, full of clotting proteins. Some medicines are made from it.":
    "खून का तरल हिस्सा, जिसमें खून जमाने वाले प्रोटीन भरे होते हैं। इससे कुछ दवाइयाँ भी बनती हैं।",
  "Proteins": "प्रोटीन",
  Emergencies: "इमरजेंसी",
  "Road accidents and trauma.": "सड़क हादसे और गंभीर चोटें।",
  Surgery: "ऑपरेशन",
  "Some planned and emergency operations.": "कुछ पहले से तय और इमरजेंसी ऑपरेशन।",
  Mothers: "माँएँ",
  "Heavy bleeding around childbirth.": "डिलीवरी के आसपास ज़्यादा खून बहना।",
  "Cancer care": "कैंसर का इलाज",
  "Treatments that lower blood counts.": "ऐसे इलाज जिनसे ब्लड काउंट (खून की गिनती) कम हो जाता है।",
  "Regular transfusions": "नियमित रूप से खून चढ़ाना",
  "Conditions like thalassaemia.": "थैलेसीमिया जैसी बीमारियाँ।",
  "And more": "और भी",
  "Some newborns, burns, clotting disorders.": "कुछ नवजात बच्चे, जलने के मरीज़, खून जमने से जुड़ी बीमारियाँ।",
  "Voluntary is safest": "स्वैच्छिक रक्तदान सबसे सुरक्षित",
  "Free, unpaid donors are recognised as the safest source of blood.":
    "बिना पैसे लिए, अपनी मर्ज़ी से खून देने वाले डोनर को खून का सबसे सुरक्षित स्रोत माना जाता है।",
  Fact: "तथ्य",
  "Can't be made": "बनाया नहीं जा सकता",
  "There's no lab-made substitute for blood in routine care.": "आम इलाज में खून का कोई लैब में बना विकल्प नहीं है।",
  "It doesn't keep": "ज़्यादा दिन नहीं टिकता",
  "Platelets last days, red cells weeks. Steady donors matter.":
    "प्लेटलेट्स कुछ दिन चलते हैं, रेड सेल्स कुछ हफ़्ते। लगातार आने वाले डोनर मायने रखते हैं।",
  "Your blood,": "आपका खून,",
  "someone's big day.": "किसी के लिए बड़ा दिन।",
  "Around 15 minutes in the chair. One needle. A big deal for someone you may never meet.":
    "कुर्सी पर लगभग 15 मिनट। एक सुई। और किसी ऐसे इंसान के लिए बड़ी बात, जिनसे आप शायद कभी न मिलें।",
  "One donation is usually split into parts, so it can help in different ways.":
    "एक रक्तदान को आमतौर पर हिस्सों में बाँटा जाता है, ताकि वह अलग-अलग तरह से मदद कर सके।",
  "Blood can't be manufactured. Every unit comes from a person who chose to give.":
    "खून फ़ैक्ट्री में नहीं बनाया जा सकता। हर यूनिट किसी ऐसे इंसान से आती है जिसने खुद देना चुना।",
  "Platelets last only days, so steady, regular donors matter most.":
    "प्लेटलेट्स सिर्फ़ कुछ दिन चलते हैं, इसलिए लगातार, नियमित डोनर सबसे ज़्यादा मायने रखते हैं।",
  "Doctors decide who needs blood. The blood centre decides who can donate.":
    "किसे खून चाहिए, यह डॉक्टर तय करते हैं। कौन रक्तदान कर सकता है, यह ब्लड बैंक तय करता है।",
  "One donation": "एक रक्तदान",
  "Three superpowers": "तीन सुपरपावर",
  "Some parts can be collected directly by a machine.": "कुछ हिस्से मशीन से सीधे लिए जा सकते हैं।",
  "Real people": "असली लोग",
  "Who it helps": "यह किसकी मदद करता है",
  "Why regulars rock": "नियमित डोनर क्यों खास हैं",
  "Why it has to be you": "आपकी ज़रूरत क्यों है",
  "More on blood components": "खून के हिस्सों के बारे में और जानकारी",
  "Blood centres usually separate donated whole blood into components, so that each patient can receive the part they need. {redCells} carry oxygen around the body. {platelets} help blood to clot and stop bleeding; they are often needed by people whose platelet count is low, as decided by their doctors. {plasma} may be used for some bleeding and clotting problems, and certain medicines are made from donated plasma.":
    "ब्लड बैंक आमतौर पर दान किए गए होल ब्लड को अलग-अलग हिस्सों में बाँट देते हैं, ताकि हर मरीज़ को वही हिस्सा मिले जिसकी उसे ज़रूरत है। {redCells} पूरे शरीर में ऑक्सीजन पहुँचाते हैं। {platelets} खून जमने और खून का बहना रोकने में मदद करते हैं; अक्सर उन लोगों को इनकी ज़रूरत होती है जिनका प्लेटलेट काउंट कम है, जैसा उनके डॉक्टर तय करें। {plasma} का इस्तेमाल खून बहने और खून जमने की कुछ समस्याओं में हो सकता है, और दान किए गए प्लाज़्मा से कुछ दवाइयाँ भी बनती हैं।",
  "Why voluntary, regular donors matter": "स्वैच्छिक, नियमित डोनर क्यों ज़रूरी हैं",
  "Health authorities, including the World Health Organization and India's national blood transfusion guidelines, recognise regular voluntary, non-remunerated donors as the safest source of blood. People who donate freely, without payment or pressure, have every reason to answer health questions honestly.":
    "विश्व स्वास्थ्य संगठन (WHO) और भारत की राष्ट्रीय ब्लड ट्रांसफ़्यूज़न गाइडलाइन समेत स्वास्थ्य संस्थाएँ, बिना पैसे लिए नियमित रूप से अपनी मर्ज़ी से खून देने वाले डोनर को खून का सबसे सुरक्षित स्रोत मानती हैं। जो लोग बिना पैसे या दबाव के, अपनी मर्ज़ी से रक्तदान करते हैं, उनके पास सेहत से जुड़े सवालों का सच्चा जवाब देने की हर वजह होती है।",
  "Donated components have limited shelf lives. Red cells can be stored for some weeks, but platelets last only a few days. That is why steady, regular donation matters more than one-off drives.":
    "दान किए गए हिस्से सीमित समय तक ही रखे जा सकते हैं। रेड सेल्स कुछ हफ़्तों तक रखे जा सकते हैं, पर प्लेटलेट्स सिर्फ़ कुछ दिन चलते हैं। इसीलिए एक बार के रक्तदान अभियानों से ज़्यादा, लगातार और नियमित रक्तदान मायने रखता है।",
  "Medical decisions stay with professionals": "इलाज से जुड़े फ़ैसले डॉक्टर और जानकार ही लेते हैं",
  "General information, not medical advice. The blood centre's doctor decides whether you can donate, and a patient's treating doctors decide whether they need a transfusion. See {link}.":
    "यह आम जानकारी है, डॉक्टरी सलाह नहीं। आप रक्तदान कर सकते हैं या नहीं, यह ब्लड बैंक के डॉक्टर तय करते हैं, और मरीज़ को खून चढ़ाने की ज़रूरत है या नहीं, यह उनका इलाज करने वाले डॉक्टर तय करते हैं। देखें: {link}।",

  // --- FAQ (src/app/(site)/faq/page.tsx) --------------------------------------------
  "Answers to common questions about blood donation, privacy, verified requests and how Rakt Response works.":
    "रक्तदान, प्राइवेसी, पुष्टि हुई रिक्वेस्ट और Rakt Response कैसे काम करता है, इन पर आम सवालों के जवाब।",
  Donating: "रक्तदान",
  "About donating": "रक्तदान के बारे में",
  "Is donating blood safe?": "क्या रक्तदान करना सुरक्षित है?",
  "At licensed centres, trained staff use sterile, single-use equipment that is thrown away after each donor, so it can't pass an infection to you. Most people feel fine; some feel briefly light-headed, which is why you rest before leaving. See {link}.":
    "लाइसेंस वाले ब्लड बैंक में, ट्रेनिंग पाए कर्मचारी स्टेराइल और सिर्फ़ एक बार इस्तेमाल होने वाला सामान लगाते हैं, जिसे हर डोनर के बाद फेंक दिया जाता है, इसलिए इससे आपको कोई इन्फ़ेक्शन नहीं लग सकता। ज़्यादातर लोग ठीक महसूस करते हैं; कुछ को थोड़ी देर के लिए हल्का चक्कर आता है, इसीलिए जाने से पहले आप आराम करते हैं। देखें: {link}।",
  "what to expect": "रक्तदान में क्या-क्या होता है",
  "How often can I donate?": "मैं कितनी बार रक्तदान कर सकता/सकती हूँ?",
  "It depends on the type. Whole blood needs the longest gap, and in India it typically differs for men and women; SDP has its own, shorter interval. The blood centre decides each time ({link}).":
    "यह रक्तदान के प्रकार पर निर्भर करता है। होल ब्लड के बाद सबसे लंबा अंतर चाहिए, और भारत में यह आमतौर पर पुरुषों और महिलाओं के लिए अलग होता है; SDP का अपना, कम अंतर होता है। हर बार फ़ैसला ब्लड बैंक करता है ({link})।",
  "eligibility info": "योग्यता की जानकारी",
  "What is the difference between whole blood and SDP?": "होल ब्लड और SDP में क्या फ़र्क है?",
  "Whole blood goes into a bag and is separated into components later. SDP (single donor platelets) uses a machine to keep only platelets and return the rest; it takes longer, needs extra checks, and the two are not interchangeable ({link}).":
    "होल ब्लड एक बैग में जाता है और बाद में उसके हिस्से अलग किए जाते हैं। SDP (एक डोनर से प्लेटलेट्स) में मशीन सिर्फ़ प्लेटलेट्स रखती है और बाकी खून वापस कर देती है; इसमें ज़्यादा समय लगता है, ज़्यादा जाँच होती है, और एक की जगह दूसरा नहीं चलता ({link})।",
  "compare types": "दोनों की तुलना देखें",
  "Does registering mean I am eligible to donate?": "क्या रजिस्टर करने का मतलब है कि मैं रक्तदान कर सकता/सकती हूँ?",
  "No. Registering only means you're willing to be contacted. Rakt Response doesn't decide eligibility; the blood centre's doctor screens you at every donation, and their decision is final.":
    "नहीं। रजिस्टर करने का मतलब सिर्फ़ इतना है कि आप संपर्क के लिए तैयार हैं। योग्यता Rakt Response तय नहीं करता; हर रक्तदान पर ब्लड बैंक के डॉक्टर आपकी जाँच करते हैं, और उनका फ़ैसला आखिरी होता है।",
  "Does Rakt Response pay donors?": "क्या Rakt Response डोनर को पैसे देता है?",
  "No. We support voluntary, non-remunerated donation only. Nobody should ask for or offer money to donate through the platform; if it happens, please tell us.":
    "नहीं। हम सिर्फ़ अपनी मर्ज़ी से, बिना पैसे के रक्तदान का साथ देते हैं। इस प्लेटफ़ॉर्म के ज़रिए रक्तदान के लिए किसी को भी पैसे माँगने या देने नहीं चाहिए; अगर ऐसा हो, तो कृपया हमें बताएँ।",
  Privacy: "प्राइवेसी",
  "Privacy and your profile": "प्राइवेसी और आपकी प्रोफ़ाइल",
  "Who can see my phone number?": "मेरा फ़ोन नंबर कौन देख सकता है?",
  "Nobody publicly. Only an authorised volunteer coordinating a verified request can see it, and only if you've consented to be contacted. Every access is logged.":
    "सबके सामने कोई नहीं। इसे सिर्फ़ वह अधिकृत स्वयंसेवक देख सकता है जो पुष्टि हुई रिक्वेस्ट संभाल रहा है, और वह भी तभी जब आपने संपर्क के लिए सहमति दी हो। हर बार देखे जाने का रिकॉर्ड रखा जाता है।",
  "Can I hide my profile or withdraw my consent?": "क्या मैं अपनी प्रोफ़ाइल छिपा सकता/सकती हूँ या अपनी सहमति वापस ले सकता/सकती हूँ?",
  "Yes, any time. In Privacy & settings you can switch directory visibility, contact permission and alerts on or off, and changes apply straight away ({link}).":
    "हाँ, कभी भी। “प्राइवेसी और सेटिंग्स” में आप डायरेक्टरी में दिखना, संपर्क की इजाज़त और अलर्ट चालू या बंद कर सकते हैं, और बदलाव तुरंत लागू हो जाते हैं ({link})।",
  "Will I get SMS or WhatsApp spam?": "क्या मुझे SMS या WhatsApp पर फ़ालतू मैसेज आएँगे?",
  "No. We don't send bulk messages. Updates are in-app, and a volunteer contacts you directly only about a verified request, and only with your consent.":
    "नहीं। हम एक साथ ढेर सारे (बल्क) मैसेज नहीं भेजते। अपडेट ऐप में ही मिलते हैं, और स्वयंसेवक आपसे सीधे सिर्फ़ पुष्टि हुई रिक्वेस्ट के बारे में संपर्क करते हैं, और वह भी सिर्फ़ आपकी सहमति से।",
  "How do I delete my account?": "मैं अपना खाता कैसे डिलीट करूँ?",
  "Request deletion from Settings. You're removed from donor discovery at once and an administrator completes the request; your contact details, location and profile are anonymised, though aggregated, non-identifying counts may remain.":
    "सेटिंग्स में जाकर डिलीट करने की रिक्वेस्ट करें। आपको तुरंत डोनर खोज से हटा दिया जाता है और एक एडमिन रिक्वेस्ट पूरी करता है; आपकी संपर्क जानकारी, जगह और प्रोफ़ाइल से आपकी पहचान हटा दी जाती है, हालाँकि कुल गिनती वाले आँकड़े, जिनसे आपकी पहचान नहीं होती, रह सकते हैं।",
  "Blood requests and emergencies": "खून की रिक्वेस्ट और इमरजेंसी",
  "What should I do in an emergency?": "इमरजेंसी में मुझे क्या करना चाहिए?",
  "Contact the treating hospital or the nearest licensed blood bank immediately, and don't wait for a response on Rakt Response. We can help find voluntary donors, but we are not an emergency service.":
    "तुरंत इलाज करने वाले अस्पताल या नज़दीकी लाइसेंस वाले ब्लड बैंक से संपर्क करें, और Rakt Response पर जवाब का इंतज़ार न करें। हम स्वैच्छिक डोनर ढूँढने में मदद कर सकते हैं, पर हम इमरजेंसी सेवा नहीं हैं।",
  "How are blood requests verified?": "खून की रिक्वेस्ट की पुष्टि कैसे होती है?",
  "An authorised volunteer checks the details with the requester or hospital before marking a request verified. Unverified requests are never shown as confirmed.":
    "किसी रिक्वेस्ट को पुष्टि हुई बताने से पहले, एक अधिकृत स्वयंसेवक रिक्वेस्ट करने वाले या अस्पताल से जानकारी जाँचता है। जिन रिक्वेस्ट की पुष्टि नहीं हुई, उन्हें कभी पक्का करके नहीं दिखाया जाता।",
  "Does Rakt Response guarantee blood?": "क्या Rakt Response खून मिलने की गारंटी देता है?",
  "No. We coordinate between voluntary donors and people seeking blood; we don't store blood, reserve units, certify compatibility or guarantee a donor will be available. Hospitals and licensed blood banks remain responsible for supplying blood.":
    "नहीं। हम स्वैच्छिक डोनर और खून ढूँढ रहे लोगों के बीच तालमेल करते हैं; हम खून जमा नहीं करते, यूनिट बुक करके नहीं रखते, ब्लड मैच की पुष्टि नहीं करते और यह गारंटी भी नहीं देते कि डोनर मिलेगा। खून देने की ज़िम्मेदारी अस्पतालों और लाइसेंस वाले ब्लड बैंकों की ही रहती है।",
  Records: "रिकॉर्ड",
  "Donation records and stories": "रक्तदान रिकॉर्ड और कहानियाँ",
  "What do “self-reported” and “verified” donations mean?": "“खुद बताया गया” और “पुष्टि हुई” रक्तदान का क्या मतलब है?",
  "{selfReported} means you added it yourself; it becomes {verified} once a volunteer or administrator checks it against supporting details. Neither label is a medical decision about when you can donate next.":
    "{selfReported} का मतलब है कि आपने इसे खुद जोड़ा है; जब कोई स्वयंसेवक या एडमिन इसे सबूत वाली जानकारी से मिलाकर जाँच लेता है, तो इस पर {verified} का लेबल लग जाता है। इनमें से कोई भी लेबल इस बारे में डॉक्टरी फ़ैसला नहीं है कि आप अगली बार कब रक्तदान कर सकते हैं।",
  verified: "पुष्टि हुई",
  "How are stories published?": "कहानियाँ कैसे प्रकाशित होती हैं?",
  "Only after review by our team and with your consent. You choose what to share and can withdraw your story later.":
    "सिर्फ़ हमारी टीम की जाँच के बाद और आपकी सहमति से। क्या बताना है, यह आप चुनते हैं, और बाद में अपनी कहानी वापस भी ले सकते हैं।",
  "Questions?": "सवाल?",
  "Answers.": "जवाब।",
  "Short answers about donating, privacy and how Rakt Response works. Tap a question to open it.":
    "रक्तदान, प्राइवेसी और Rakt Response कैसे काम करता है, इन पर छोटे जवाब। जवाब देखने के लिए सवाल पर टैप करें।",
  "FAQ sections": "सवाल-जवाब के हिस्से",
  "Donating at a licensed centre uses sterile, single-use kit.":
    "लाइसेंस वाले ब्लड बैंक में रक्तदान के लिए स्टेराइल, एक बार इस्तेमाल होने वाला सामान लगता है।",
  "Registering isn't eligibility. The blood centre decides, every time.":
    "रजिस्टर करने का मतलब योग्यता नहीं है। हर बार फ़ैसला ब्लड बैंक करता है।",
  "Your number is never public. Contact needs your consent.": "आपका नंबर कभी सबके सामने नहीं आता। संपर्क के लिए आपकी सहमति ज़रूरी है।",
  "Emergency? Go to the treating hospital or a licensed blood bank now.":
    "इमरजेंसी है? अभी इलाज करने वाले अस्पताल या लाइसेंस वाले ब्लड बैंक जाएँ।",
  "Rakt Response is not a hospital or blood bank": "Rakt Response अस्पताल या ब्लड बैंक नहीं है",
  "We coordinate between voluntary donors and people seeking blood. We can't guarantee availability or compatibility.":
    "हम स्वैच्छिक डोनर और खून ढूँढ रहे लोगों के बीच तालमेल करते हैं। हम खून मिलने या ब्लड मैच की गारंटी नहीं दे सकते।",
  "Still have a question?": "अब भी कोई सवाल है?",
  "For questions about your own health, talk to a blood centre or your doctor. For anything about Rakt Response, {link}.":
    "अपनी सेहत से जुड़े सवालों के लिए, किसी ब्लड बैंक या अपने डॉक्टर से बात करें। Rakt Response के बारे में कुछ भी पूछना हो, तो {link}।",
  "contact us": "हमसे संपर्क करें",

  // --- About (src/app/(site)/about/page.tsx) ----------------------------------------
  "Rakt Response is a volunteer community team that helps voluntary blood donors and people seeking blood connect safely, with privacy and consent built in.":
    "Rakt Response स्वयंसेवकों की एक सामुदायिक टीम है, जो स्वैच्छिक रक्तदाताओं और खून ढूँढ रहे लोगों को सुरक्षित तरीके से जोड़ती है, प्राइवेसी और सहमति के साथ।",
  "Donor registry": "डोनर रजिस्टर",
  "Your blood group, rough area and availability. Private by default.":
    "आपका ब्लड ग्रुप, मोटे तौर पर आपका इलाका और आप कब उपलब्ध हैं। शुरू से ही प्राइवेट।",
  "Donors": "डोनर",
  "Verified requests": "जाँची गई रिक्वेस्ट",
  "Volunteers check every request with the requester or hospital first.":
    "स्वयंसेवक हर रिक्वेस्ट को पहले रिक्वेस्ट करने वाले या अस्पताल से जाँचते हैं।",
  "Checked": "जाँचा गया",
  "Log your donations and keep track of the gaps between them.": "अपने रक्तदान दर्ज करें और उनके बीच के अंतर का ध्यान रखें।",
  "Yours": "आपका",
  "Blood 101": "खून की बुनियादी बातें",
  "Plain-language guides to donating. No jargon.": "रक्तदान पर आसान भाषा में जानकारी। कोई मुश्किल शब्द नहीं।",
  "Learn": "जानें",
  "Connect voluntary donors and people seeking blood via authorised volunteers":
    "अधिकृत स्वयंसेवकों के ज़रिए स्वैच्छिक डोनर और खून ढूँढ रहे लोगों को जोड़ते हैं",
  "Check requests before showing them as verified": "रिक्वेस्ट को पुष्टि हुई दिखाने से पहले उनकी जाँच करते हैं",
  "Keep your contact details private, shared only with consent": "आपकी संपर्क जानकारी प्राइवेट रखते हैं, सिर्फ़ सहमति से शेयर करते हैं",
  "Share general, responsible info about donating": "रक्तदान के बारे में आम और ज़िम्मेदार जानकारी देते हैं",
  "Store, test or process blood": "खून जमा नहीं करते, न उसकी जाँच या प्रोसेसिंग करते हैं",
  "Reserve or hold blood units": "खून की यूनिट बुक करके या रोककर नहीं रखते",
  "Certify compatibility or medical suitability": "ब्लड मैच या डॉक्टरी तौर पर सही होने की पुष्टि नहीं करते",
  "Guarantee a donor will be available": "डोनर मिलने की गारंटी नहीं देते",
  "Replace hospitals, doctors or licensed blood banks": "अस्पताल, डॉक्टर या लाइसेंस वाले ब्लड बैंक की जगह नहीं लेते",
  "You register": "आप रजिस्टर करते हैं",
  "Blood group, general area, donation types you're open to.": "ब्लड ग्रुप, आम इलाका, और जिस तरह के रक्तदान के लिए आप तैयार हैं।",
  "You stay private": "आपकी जानकारी प्राइवेट रहती है",
  "Your profile and number are never listed publicly.": "आपकी प्रोफ़ाइल और नंबर कभी सबके सामने नहीं दिखाए जाते।",
  "We verify": "हम जाँच करते हैं",
  "A volunteer checks each request with the requester or hospital.": "एक स्वयंसेवक हर रिक्वेस्ट को रिक्वेस्ट करने वाले या अस्पताल से जाँचता है।",
  "You choose": "आप चुनते हैं",
  "We contact you only if you agreed. Saying no is always fine.": "हम आपसे तभी संपर्क करते हैं जब आपने हाँ कहा हो। मना करना हमेशा ठीक है।",
  "You log it": "आप दर्ज करते हैं",
  "Add your donation. It stays self-reported until verified.": "अपना रक्तदान जोड़ें। पुष्टि होने तक यह “खुद बताया गया” रहता है।",
  "About us": "हमारे बारे में",
  "People helping": "लोगों की मदद करते",
  "people.": "लोग।",
  "Rakt Response is a volunteer community team. We help donors and people seeking blood find each other, safely.":
    "Rakt Response स्वयंसेवकों की एक सामुदायिक टीम है। हम डोनर और खून ढूँढ रहे लोगों को सुरक्षित तरीके से एक-दूसरे तक पहुँचने में मदद करते हैं।",
  "Volunteer-run": "स्वयंसेवकों द्वारा",
  "Privacy first": "प्राइवेसी सबसे पहले",
  "Never paid": "कभी पैसे नहीं",
  "We coordinate. Licensed blood centres collect and supply blood.": "हम तालमेल करते हैं। खून लेने और देने का काम लाइसेंस वाले ब्लड बैंक करते हैं।",
  "Every request is checked by a volunteer before it shows as verified.":
    "पुष्टि हुई दिखने से पहले हर रिक्वेस्ट को एक स्वयंसेवक जाँचता है।",
  "Your number stays private. Contact happens only with your consent.": "आपका नंबर प्राइवेट रहता है। संपर्क सिर्फ़ आपकी सहमति से होता है।",
  "Emergency? Go straight to the treating hospital or a licensed blood bank.":
    "इमरजेंसी है? सीधे इलाज करने वाले अस्पताल या लाइसेंस वाले ब्लड बैंक जाएँ।",
  "Our mission": "हमारा मिशन",
  "A calmer path to blood. A donor who feels respected.": "खून पाने का एक आसान, सुकून भरा रास्ता। ऐसा डोनर जो सम्मान महसूस करे।",
  "The platform": "प्लेटफ़ॉर्म",
  "What we built": "हमने क्या बनाया",
  "Straight talk": "साफ़ बात",
  "What we do, and don't": "हम क्या करते हैं, और क्या नहीं",
  "We do": "हम करते हैं",
  "We don't": "हम नहीं करते",
  "In an emergency": "इमरजेंसी में",
  "Contact the treating hospital or the nearest licensed blood bank immediately. Please don't wait for a response on Rakt Response.":
    "तुरंत इलाज करने वाले अस्पताल या नज़दीकी लाइसेंस वाले ब्लड बैंक से संपर्क करें। कृपया Rakt Response पर जवाब का इंतज़ार न करें।",
  "How it works": "यह कैसे काम करता है",
  "Five simple steps": "पाँच आसान कदम",
  "Who we are": "हम कौन हैं",
  "Rakt Response is run by a community team of volunteers. We are donors, family members of patients and people who have seen how stressful it can be to look for blood in a hurry. We came together to make that search more organised, more private and more respectful for everyone involved.":
    "Rakt Response को स्वयंसेवकों की एक सामुदायिक टीम चलाती है। हम डोनर हैं, मरीज़ों के परिवार वाले हैं, और ऐसे लोग हैं जिन्होंने देखा है कि जल्दी में खून ढूँढना कितना तनाव भरा हो सकता है। हम इसलिए साथ आए ताकि यह खोज सबके लिए ज़्यादा व्यवस्थित, ज़्यादा प्राइवेट और ज़्यादा सम्मान भरी हो।",
  "We are not a hospital or a blood bank. Our role is coordination: helping the right people talk to each other, with consent, so that donation can happen at a licensed blood centre.":
    "हम अस्पताल या ब्लड बैंक नहीं हैं। हमारा काम तालमेल है: सहमति के साथ सही लोगों की आपस में बात कराना, ताकि रक्तदान किसी लाइसेंस वाले ब्लड बैंक में हो सके।",
  "How we report our work and protect your data": "हम अपने काम की जानकारी कैसे देते हैं और आपका डेटा कैसे बचाते हैं",
  "We share only figures that have been checked. See {impact}. To learn how we protect your information and how consent works, read our {privacy}.":
    "हम सिर्फ़ जाँचे गए आँकड़े ही शेयर करते हैं। देखें: {impact}। हम आपकी जानकारी कैसे बचाते हैं और सहमति कैसे काम करती है, यह जानने के लिए हमारी {privacy} पढ़ें।",
  "Together we can.": "साथ मिलकर हम कर सकते हैं।",
};

export default hi;
