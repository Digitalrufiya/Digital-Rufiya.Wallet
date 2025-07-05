const alBaqarah = [
  { verse: 1, arabic: "الم", english: "Alif, Lam, Meem." },
  { verse: 2, arabic: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ", english: "This is the Book about which there is no doubt, a guidance for those conscious of Allah." },
  { verse: 3, arabic: "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ", english: "Who believe in the unseen, establish prayer, and spend out of what We have provided for them." },
  { verse: 4, arabic: "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ", english: "And who believe in what has been revealed to you, [O Muhammad], and what was revealed before you, and of the Hereafter they are certain [in faith]." },
  { verse: 5, arabic: "أُو۟لَـٰٓئِكَ عَلَىٰ هُدًۭى مِّن رَّبِّهِمْ ۖ وَأُو۟لَـٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ", english: "It is they who are upon guidance from their Lord, and it is they who will be successful." },
  { verse: 6, arabic: "إِنَّ ٱلَّذِينَ كَفَرُواْ سَوَآءٌ عَلَيْهِمْ ءَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ", english: "Indeed, those who disbelieve – it is all the same for them whether you warn them or do not warn them – they will not believe." },
  { verse: 7, arabic: "خَتَمَ ٱللَّهُ عَلَىٰ قُلُوبِهِمْ وَعَلَىٰ سَمْعِهِمْ ۖ وَعَلَىٰٓ أَبْصَـٰرِهِمْ غِشَـٰوَةٌ ۖ وَلَهُمْ عَذَابٌ عَظِيمٌ", english: "Allah has set a seal upon their hearts and upon their hearing, and over their vision is a veil. And for them is a great punishment." },
  { verse: 8, arabic: "وَمِنَ ٱلنَّاسِ مَن يَقُولُ ءَامَنَّا بِٱللَّهِ وَبِٱلْيَوْمِ ٱلْـَٔاخِرِ وَمَا هُم بِمُؤْمِنِينَ", english: "And of the people are some who say, 'We believe in Allah and the Last Day,' but they are not believers." },
  { verse: 9, arabic: "يُخَـٰدِعُونَ ٱللَّهَ وَٱلَّذِينَ ءَامَنُواْ وَمَا يَخْدَعُونَ إِلَّآ أَنفُسَهُمْ وَمَا يَشْعُرُونَ", english: "They [think to] deceive Allah and those who believe, but they deceive not except themselves and perceive [it] not." },
  { verse: 10, arabic: "فِى قُلُوبِهِم مَّرَضٌۭ فَزَادَهُمُ ٱللَّهُ مَرَضًۭا ۖ وَلَهُمْ عَذَابٌ أَلِيمٌۢ بِمَا كَانُواْ يَكْذِبُونَ", english: "In their hearts is disease, so Allah has increased their disease; and for them is a painful punishment because they [habitually] used to lie." },
  { verse: 11, arabic: "وَإِذَا قِيلَ لَهُمْ لَا تُفْسِدُواْ فِى ٱلْأَرْضِ قَالُوٓاْ إِنَّمَا نَحْنُ مُصْلِحُونَ", english: "And when it is said to them, 'Do not cause corruption on the earth,' they say, 'We are but reformers.'" },
  { verse: 12, arabic: "أَلَآ إِنَّهُمْ هُمُ ٱلْمُفْسِدُونَ وَلَـٰكِن لَّا يَشْعُرُونَ", english: "Unquestionably, it is they who are the corrupters, but they perceive [it] not." },
  { verse: 13, arabic: "وَإِذَا قِيلَ لَهُمْ ءَامِنُواْ كَمَآ ءَامَنَ ٱلنَّاسُ قَالُوٓاْ أَنُؤْمِنُ كَمَآ ءَامَنَ ٱلسُّفَهَآءُ", english: "And when it is said to them, 'Believe as the people have believed,' they say, 'Should we believe as the foolish have believed?' Unquestionably, it is they who are the foolish, but they know [it] not." },
  { verse: 14, arabic: "وَإِذَا لَقُواْ ٱلَّذِينَ ءَامَنُواْ قَالُوٓاْ ءَامَنَّا", english: "And when they meet those who believe, they say, 'We believe'; but when they are alone with their evil ones, they say, 'Indeed, we are with you; we were only mockers.'" },
  { verse: 15, arabic: "ٱللَّهُ يَسْتَهْزِئُ بِهِمْ وَيَمُدُّهُمْ فِى طُغْيَـٰنِهِمْ يَعْمَهُونَ", english: "Allah mocks them and prolongs them in their transgression [while] they wander blindly." },
  { verse: 16, arabic: "أُو۟لَـٰٓئِكَ ٱلَّذِينَ ٱشْتَرَوُاْ ٱلضَّلَـٰلَةَ بِٱلْهُدَىٰ", english: "Those are the ones who have purchased error [in exchange] for guidance, so their transaction has brought no profit, nor were they guided." },
  { verse: 17, arabic: "مَّثَلُهُمْ كَمَثَلِ ٱلَّذِى ٱسْتَوْقَدَ نَارًۭا", english: "Their example is that of one who kindled a fire, but when it illuminated what was around him, Allah took away their light and left them in darkness [so] they could not see." },
  { verse: 18, arabic: "صُمٌّۭ بُكْمٌ عُمْىٌۭ فَهُمْ لَا يَرْجِعُونَ", english: "Deaf, dumb and blind – so they will not return [to the right path]." },
  { verse: 19, arabic: "أَوْ كَصَيِّبٍۢ مِّنَ ٱلسَّمَآءِ", english: "Or [their deeds] are like a rainstorm from the sky, within which is darkness, thunder, and lightning..." },
  { verse: 20, arabic: "يَجْعَلُونَ أَصَـٰبِعَهُمْ فِىٓ ءَاذَانِهِم", english: "They put their fingers in their ears against the thunderclaps in dread of death. But Allah is encompassing of the disbelievers." }
];
alBaqarah.push(
  { verse: 21, arabic: "يَـٰٓأَيُّهَا ٱلنَّاسُ ٱعْبُدُواْ رَبَّكُمُ ٱلَّذِى خَلَقَكُمْ", english: "O mankind, worship your Lord, who created you and those before you, that you may become righteous." },
  { verse: 22, arabic: "ٱلَّذِى جَعَلَ لَكُمُ ٱلْأَرْضَ فِرَٰشًۭا وَٱلسَّمَآءَ بِنَآءًۭ", english: "He who made for you the earth a bed and the sky a canopy, and sent down from the sky rain and brought forth thereby fruits as provision for you..." },
  { verse: 23, arabic: "وَإِن كُنتُمْ فِى رَيْبٍۢ مِّمَّا نَزَّلْنَا", english: "And if you are in doubt about what We have sent down upon Our Servant [Muhammad], then produce a surah the like thereof..." },
  { verse: 24, arabic: "فَإِن لَّمْ تَفْعَلُواْ وَلَن تَفْعَلُواْ", english: "But if you do not—and you will never be able to—then fear the Fire, whose fuel is people and stones, prepared for the disbelievers." },
  { verse: 25, arabic: "وَبَشِّرِ ٱلَّذِينَ ءَامَنُواْ وَعَمِلُواْ ٱلصَّـٰلِحَـٰتِ", english: "And give good tidings to those who believe and do righteous deeds that they will have gardens [in Paradise] beneath which rivers flow..." },
  { verse: 26, arabic: "إِنَّ ٱللَّهَ لَا يَسْتَحْىِۦٓ أَن يَضْرِبَ مَثَلًۭا مَّا", english: "Indeed, Allah is not timid to present an example – that of a mosquito or what is smaller than it..." },
  { verse: 27, arabic: "ٱلَّذِينَ يَنقُضُونَ عَهْدَ ٱللَّهِ", english: "Who break the covenant of Allah after contracting it and sever what Allah has ordered to be joined..." },
  { verse: 28, arabic: "كَيْفَ تَكْفُرُونَ بِٱللَّهِ وَكُنتُمْ أَمْوَٰتًۭا فَأَحْيَـٰكُمْ", english: "How can you disbelieve in Allah when you were lifeless and He brought you to life..." },
  { verse: 29, arabic: "هُوَ ٱلَّذِى خَلَقَ لَكُم مَّا فِى ٱلْأَرْضِ جَمِيعًۭا", english: "It is He who created for you all of that which is on the earth. Then He directed Himself to the heaven and made them seven heavens..." },
  { verse: 30, arabic: "وَإِذْ قَالَ رَبُّكَ لِلْمَلَـٰٓئِكَةِ إِنِّى جَاعِلٌۭ فِى ٱلْأَرْضِ خَلِيفَةًۭ", english: "And [mention, O Muhammad], when your Lord said to the angels, 'Indeed, I will make upon the earth a successive authority.'" },
  { verse: 31, arabic: "وَعَلَّمَ ءَادَمَ ٱلْأَسْمَآءَ كُلَّهَا", english: "And He taught Adam the names – all of them. Then He showed them to the angels..." },
  { verse: 32, arabic: "قَالُواْ سُبْحَـٰنَكَ لَا عِلْمَ لَنَآ إِلَّا مَا عَلَّمْتَنَآ", english: "They said, 'Exalted are You; we have no knowledge except what You have taught us...'" },
  { verse: 33, arabic: "قَالَ يَـٰٓـَٔادَمُ أَنبِئْهُم بِأَسْمَآئِهِمْ", english: "He said, 'O Adam, inform them of their names.' And when he had informed them of their names..." },
  { verse: 34, arabic: "وَإِذْ قُلْنَا لِلْمَلَـٰٓئِكَةِ ٱسْجُدُواْ لِـَٔادَمَ", english: "And [mention] when We said to the angels, 'Prostrate before Adam'; so they prostrated, except for Iblis..." },
  { verse: 35, arabic: "وَقُلْنَا يَـٰٓـَٔادَمُ ٱسْكُنْ أَنتَ وَزَوْجُكَ ٱلْجَنَّةَ", english: "And We said, 'O Adam, dwell, you and your wife, in Paradise and eat therefrom in [ease and] abundance..." },
  { verse: 36, arabic: "فَأَزَلَّهُمَا ٱلشَّيْطَـٰنُ عَنْهَا", english: "But Satan caused them to slip out of it and removed them from that [condition] in which they had been..." },
  { verse: 37, arabic: "فَتَلَقَّىٰٓ ءَادَمُ مِن رَّبِّهِۦ كَلِمَـٰتٍۢ", english: "Then Adam received from his Lord [some] words, and He accepted his repentance..." },
  { verse: 38, arabic: "قُلْنَا ٱهْبِطُواْ مِنْهَا جَمِيعًۭا ۖ", english: "We said, 'Go down from it, all of you. And when guidance comes to you from Me..." },
  { verse: 39, arabic: "وَٱلَّذِينَ كَفَرُواْ وَكَذَّبُواْ بِـَٔايَـٰتِنَآ", english: "But those who disbelieve and deny Our signs – those will be companions of the Fire; they will abide therein eternally." },
  { verse: 40, arabic: "يَـٰبَنِىٓ إِسْرَٰٓءِيلَ ٱذْكُرُواْ نِعْمَتِىَ ٱلَّتِىٓ أَنْعَمْتُ عَلَيْكُمْ", english: "O Children of Israel, remember My favor that I have bestowed upon you and fulfill My covenant [upon you]..." }
);
alBaqarah.push(
  { verse: 41, arabic: "وَءَامِنُواْ بِمَآ أَنزَلْتُ مُصَدِّقًۭا لِّمَا مَعَكُمْ", english: "And believe in what I have sent down confirming that which is with you, and be not the first to disbelieve in it." },
  { verse: 42, arabic: "وَلَا تَلْبِسُواْ ٱلْحَقَّ بِٱلْبَـٰطِلِ وَتَكْتُمُواْ ٱلْحَقَّ", english: "And do not mix the truth with falsehood or conceal the truth while you know [it]." },
  { verse: 43, arabic: "وَأَقِيمُواْ ٱلصَّلَوٰةَ وَءَاتُواْ ٱلزَّكَوٰةَ", english: "And establish prayer and give zakah and bow with those who bow [in worship and obedience]." },
  { verse: 44, arabic: "أَتَأْمُرُونَ ٱلنَّاسَ بِٱلْبِرِّ وَتَنسَوْنَ أَنفُسَكُمْ", english: "Do you order righteousness of the people and forget yourselves while you recite the Scripture? Then will you not reason?" },
  { verse: 45, arabic: "وَٱسْتَعِينُواْ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ", english: "And seek help through patience and prayer, and indeed, it is difficult except for the humbly submissive [to Allah]." },
  { verse: 46, arabic: "ٱلَّذِينَ يَظُنُّونَ أَنَّهُم مُّلَـٰقُوا۟ رَبِّهِمْ", english: "Who are certain that they will meet their Lord and that they will return to Him." },
  { verse: 47, arabic: "يَـٰبَنِىٓ إِسْرَٰٓءِيلَ ٱذْكُرُواْ نِعْمَتِىَ", english: "O Children of Israel, remember My favor that I have bestowed upon you and that I preferred you over the worlds." },
  { verse: 48, arabic: "وَٱتَّقُواْ يَوْمًۭا لَّا تَجْزِى نَفْسٌ", english: "And fear a Day when no soul will suffice for another at all, nor will intercession be accepted from it..." },
  { verse: 49, arabic: "وَإِذْ نَجَّيْنَـٰكُم مِّنْ ءَالِ فِرْعَوْنَ", english: "And [recall] when We saved you from the people of Pharaoh, who were afflicting you with the worst torment..." },
  { verse: 50, arabic: "وَإِذْ فَرَقْنَا بِكُمُ ٱلْبَحْرَ", english: "And [recall] when We parted the sea for you and saved you and drowned the people of Pharaoh while you were looking on." },
  { verse: 51, arabic: "وَإِذْ وَٰعَدْنَا مُوسَىٰٓ أَرْبَعِينَ لَيْلَةًۭ", english: "And [recall] when We made an appointment with Moses for forty nights..." },
  { verse: 52, arabic: "ثُمَّ عَفَوْنَا عَنكُم مِّنۢ بَعْدِ ذَٰلِكَ", english: "Then We forgave you after that so perhaps you would be grateful." },
  { verse: 53, arabic: "وَإِذْ ءَاتَيْنَا مُوسَى ٱلْكِتَـٰبَ", english: "And [recall] when We gave Moses the Scripture and criterion that perhaps you would be guided." },
  { verse: 54, arabic: "وَإِذْ قَالَ مُوسَىٰ لِقَوْمِهِۦ", english: "And [recall] when Moses said to his people, 'O my people, indeed you have wronged yourselves by taking the calf [for worship].'" },
  { verse: 55, arabic: "وَإِذْ قُلْتُمْ يَـٰمُوسَىٰ لَن نُّؤْمِنَ لَكَ", english: "And [recall] when you said, 'O Moses, we will never believe you until we see Allah outright.' So the thunderbolt took you while you were looking on." },
  { verse: 56, arabic: "ثُمَّ بَعَثْنَـٰكُم مِّنۢ بَعْدِ مَوْتِكُمْ", english: "Then We revived you after your death that perhaps you would be grateful." },
  { verse: 57, arabic: "وَظَلَّلْنَا عَلَيْكُمُ ٱلْغَمَامَ", english: "And We shaded you with clouds and sent down to you manna and quails..." },
  { verse: 58, arabic: "وَإِذْ قُلْنَا ٱدْخُلُواْ هَـٰذِهِ ٱلْقَرْيَةَ", english: "And [recall] when We said, 'Enter this city and eat from it wherever you will in [ease and] abundance...'" },
  { verse: 59, arabic: "فَبَدَّلَ ٱلَّذِينَ ظَلَمُواْ قَوْلً", english: "But those who wronged changed [those words] to a statement other than that which had been said to them..." },
  { verse: 60, arabic: "وَإِذِ ٱسْتَسْقَىٰ مُوسَىٰ لِقَوْمِهِ", english: "And [recall] when Moses prayed for water for his people, so We said, 'Strike with your staff the stone.' And there gushed forth from it twelve springs..." }
);
alBaqarah.push(
  { verse: 61, arabic: "وَإِذْ قُلْتُمْ يَـٰمُوسَىٰ لَن نَّصْبِرَ عَلَىٰ طَعَامٍۢ وَٰحِدٍۢ فَٱدْعُ لَنَا رَبَّكَ يُخْرِجْ لَنَا مِمَّا تُنبِتُ ٱلْأَرْضُ مِن بَقْلِهَا وَقِثَّآئِهَا وَفُومِهَا وَعَدَسِهَا وَبَصَلِهَا ۖ قَالَ أَتَسْتَبْدِلُونَ ٱلَّذِى هُوَ أَدْنَىٰ بِٱلَّذِى هُوَ خَيْرٌۭ ۚ ٱهْبِطُواْ مِصْرًۭا فَإِنَّ لَكُم مَّا سَأَلْتُمْ ۗ وَضُرِبَتْ عَلَيْهِمُ ٱلذِّلَّةُ وَٱلْمَسْكَنَةُ وَبَآءُواْ بِغَضَبٍ مِّنَ ٱللَّهِ ۗ ذَٰلِكَ بِأَنَّهُمْ كَانُواْ يَكْفُرُونَ بِـَٔايَـٰتِ ٱللَّهِ وَيَقْتُلُونَ ٱلنَّبِيِّينَ بِغَيْرِ ٱلْحَقِّ ۗ ذَٰلِكَ بِمَا عَصَواْ وَّكَانُواْ يَعْتَدُونَ", english: "And [recall] when you said, 'O Moses, we can never endure one kind of food. So call upon your Lord to bring forth for us from the earth its green herbs, its cucumbers, its garlic, its lentils, and its onions.' He said, 'Would you exchange what is better for what is less? Go down to Egypt, for indeed, you will have what you have asked.' And they were covered with humiliation and poverty and returned with anger from Allah. That was because they disbelieved in the signs of Allah and killed the prophets without right. That was because they disobeyed and were [habitually] transgressing." },

  { verse: 62, arabic: "إِنَّ ٱلَّذِينَ ءَامَنُواْ وَٱلَّذِينَ هَادُواْ وَٱلنَّصَـٰرَىٰ وَٱلصَّـٰبِـِٔينَ", english: "Indeed, those who believed and those who were Jews or Christians or Sabeans – those [among them] who believed in Allah and the Last Day and did righteousness – will have their reward with their Lord, and no fear will there be concerning them, nor will they grieve." },

  { verse: 63, arabic: "وَإِذْ أَخَذْنَا مِيثَـٰقَكُمْ", english: "And [recall] when We took your covenant and We raised over you the mount, [saying], 'Take what We have given you with determination and remember what is in it that perhaps you may become righteous.'" },

  { verse: 64, arabic: "ثُمَّ تَوَلَّيْتُمْ مِن بَعْدِ ذَٰلِكَ", english: "Then you turned away after that. And if not for the favor of Allah upon you and His mercy, you would have been among the losers." },

  { verse: 65, arabic: "وَإِذْ قُلْتُمْ يَـٰمُوسَىٰ لَن نَّصْبِرَ عَلَىٰ طَعَامٍۢ وَٰحِدٍۢ", english: "And [recall] when you said, 'O Moses, we will never endure one kind of food. So call upon your Lord to bring forth for us from the earth its green herbs, its cucumbers, its garlic, its lentils, and its onions.' He said, 'Would you exchange what is better for what is less?'" },

  { verse: 66, arabic: "قَالَ أَتَسْتَبْدِلُونَ ٱلَّذِى هُوَ أَدْنَىٰ بِٱلَّذِى هُوَ خَيْرٌۭ", english: "Go down to Egypt, for indeed, you will have what you have asked. And they were covered with humiliation and poverty and returned with anger from Allah. That was because they disbelieved in the signs of Allah and killed the prophets without right. That was because they disobeyed and were [habitually] transgressing." },

  { verse: 67, arabic: "وَقَالُواْ ٱلَّذِينَ كَفَرُواْ لَن تُؤْمِنُواْ", english: "And those who disbelieved said, 'You will never believe.'" },

  { verse: 68, arabic: "قُلْ ۖ يَـٰٓأَهْلَ ٱلْكِتَـٰبِ", english: "Say, 'O People of the Scripture, do you resent us except [for the fact] that we have believed in Allah and what was revealed to us and what was revealed before, while most of you are defiantly disobedient?'" },

  { verse: 69, arabic: "قُلْ هَلْ نُنَبِّئُكُم بِشَرٍّۢ مِّن ذَٰلِكُم", english: "Say, 'Shall I inform you of [something] worse than that as penalty from Allah? [It is that of] those whom Allah has cursed and with whom He became angry and made of them apes and pigs and slaves of Taghut. Those are worse in position and further astray from the sound way.'" },

  { verse: 70, arabic: "وَإِذْ أَخَذْنَا مِيثَـٰقَكُمْ", english: "And [recall] when We took your covenant and raised over you the mount, [saying], 'Take what We have given you with determination and listen.' They said, 'We hear and disobey.' And their hearts absorbed [the worship of] the calf because of their disbelief. Say, 'Evil is that which your faith enjoins upon you, if you should be believers.'" },

  { verse: 71, arabic: "وَإِذْ قُلْتُمْ يَـٰمُوسَىٰ لَن نَّصْبِرَ عَلَىٰ طَعَامٍۢ وَٰحِدٍۢ", english: "And [recall] when you said, 'O Moses, we can never endure one kind of food. So call upon your Lord to bring forth for us from the earth its green herbs, its cucumbers, its garlic, its lentils, and its onions.' He said, 'Would you exchange what is better for what is less? Go down to Egypt, for indeed, you will have what you have asked.' And they were covered with humiliation and poverty and returned with anger from Allah. That was because they disbelieved in the signs of Allah and killed the prophets without right. That was because they disobeyed and were [habitually] transgressing." },

  { verse: 72, arabic: "وَإِذْ قَالَ مُوسَىٰ لِقَوْمِهِۦ", english: "And [recall] when Moses said to his people, 'O my people, remember the favor of Allah upon you when He appointed among you prophets and made you possessors and gave you that which He had not given anyone among the worlds.'" },

  { verse: 73, arabic: "وَإِذْ قَالَ مُوسَىٰ لِقَوْمِهِۦ", english: "And [recall] when Moses said to his people, 'Indeed, Allah commands you to slaughter a cow.' They said, 'Do you take us in ridicule?' He said, 'I seek refuge in Allah from being among the ignorant.'" },

  { verse: 74, arabic: "قَالُواْ ٱدْعُ لَنَا رَبَّكَ يُبَيِّن لَنَا مَا هِيَ", english: "They said, 'Call upon your Lord to make clear to us what it is.' Moses said, 'Indeed, He says, it is a cow which is neither old nor virgin, but median between that,' so do what you are commanded." },

  { verse: 75, arabic: "قَالُواْ ٱدْعُ لَنَا رَبَّكَ يُبَيِّن لَنَا مَا لَوْنُهَا", english: "They said, 'Call upon your Lord to make clear to us what its color is.' He said, 'It is a yellow cow, bright in color - pleasing to the observers.'" },

  { verse: 76, arabic: "قَالُواْ ٱدْعُ لَنَا رَبَّكَ يُبَيِّن لَنَا مَا هِيَ", english: "They said, 'Call upon your Lord to make clear to us what it is. Indeed, all cows look alike to us. And indeed we, if Allah wills, will be guided.'" },

  { verse: 77, arabic: "قَالَ إِنَّهُۥۤ إِلَىٰ رَبِّهِۦۤ", english: "He said, 'Indeed, it is a cow neither trained to plow the earth nor to irrigate the field, free from fault with no spot upon her.'" },

  { verse: 78, arabic: "وَإِذْ قَتَلْتُمْ نَفْسًۭا", english: "And [recall] when you killed a man and disputed over it, but Allah was to bring out that which you were concealing." },

  { verse: 79, arabic: "فَقُلْنَا ٱضْرِبُوهُ بِبَعْضِهَا", english: "So We said, 'Strike the slain man with part of it.' Thus Allah brings the dead to life and shows you His signs that you might reason." },

  { verse: 80, arabic: "ذَٰلِكَ كَانَ فِىٓ ءَايَـٰتِنَا", english: "That is from the signs of Allah that We might make clear to you. And for the people is a lesson from it and a reminder for those of understanding." }
);
alBaqarah.push(
  { verse: 80, arabic: "ذَٰلِكَ كَانَ فِىٓ ءَايَـٰتِنَا وَيَهْدِى ٱللَّهُ بِهِۦ مَن يَشَآءُ", english: "That is from the signs of Allah that We might make clear to you. And Allah guides whom He wills." },

  { verse: 81, arabic: "وَإِنَّ ٱلَّذِينَ كَفَرُواْ وَكَذَّبُواْ بِـَٔايَـٰتِنَآ أُو۟لَـٰٓئِكَ أَصْحَـٰبُ ٱلْجَحِيمِ", english: "But indeed, those who disbelieve and deny Our signs – those are the companions of the Hellfire." },

  { verse: 82, arabic: "إِنَّ ٱلَّذِينَ ءَامَنُواْ وَعَمِلُواْ ٱلصَّـٰلِحَـٰتِ أُو۟لَـٰٓئِكَ أَصْحَـٰبُ ٱلْجَنَّةِ ۖ هُمْ فِيهَا خَـٰلِدُونَ", english: "Indeed, those who believe and do righteous deeds – those are the companions of Paradise; they will abide therein eternally." },

  { verse: 83, arabic: "وَإِذْ أَخَذْنَا مِيثَـٰقَ بَنِىٓ إِسْرَٰٓءِيلَ", english: "And [recall] when We took the covenant from the Children of Israel, [enjoining upon them], 'Do not worship except Allah; and to parents do good and to relatives, orphans, and the needy. And speak to people good [words] and establish prayer and give zakah.' Then you turned away, except a few of you, and you were refusing." },

  { verse: 84, arabic: "وَإِذْ أَخَذْنَا مِيثَـٰقَكُمْ", english: "And [recall] when We took your covenant, [saying], 'Do not shed your blood or evict one another from your homes.' Then you acknowledged [this] while you were witnessing." },

  { verse: 85, arabic: "وَإِذْ أَخَذْنَا مِيثَـٰقَكُمْ", english: "But you are, over the covenant, disbelievers, and [therefore], some of you [are] evicting a party of you from their homes, cooperating against them in sin and aggression. And if they come to you as captives, you ransom them, although their eviction was forbidden to you. So do you believe in part of the Scripture and disbelieve in part? Then what is the recompense for those who do that among you except disgrace in worldly life; and on the Day of Resurrection they will be sent back to the severest of punishment. And Allah is not unaware of what you do." },

  { verse: 86, arabic: "تِلْكَ ٱلَّتِى نَقْضَ ٱلْمِيثَـٰقَ", english: "Those are the ones who have bought the life of this world [in exchange] for the Hereafter, so the punishment will not be lightened for them, nor will they be aided." },

  { verse: 87, arabic: "وَكَتَبْنَا عَلَيْهِمْ", english: "And We did put over their necks shackles to the Day of Resurrection. And Allah is severe in punishment." },

  { verse: 88, arabic: "وَإِذْ أَخَذْنَا مِيثَـٰقَكُمْ", english: "And [recall] when We took your covenant, [saying], 'We hear and we obey'; and fear Allah. Indeed, Allah is Knowing of that within the hearts." },

  { verse: 89, arabic: "فَإِن تَوَلَّوْاْ", english: "But if you turn away, then know that upon Our Messenger is only [the responsibility for] clear notification." },

  { verse: 90, arabic: "قُلْ يَـٰٓأَيُّهَا ٱلۡكَـٰفِرُونَ", english: "Say, 'O disbelievers, I do not worship what you worship." },

  { verse: 91, arabic: "وَلَآ أَنتُمْ عَـٰبِدُونَ", english: "Nor are you worshippers of what I worship." },

  { verse: 92, arabic: "وَلَآ أَنَا عَـٰبِدٌۭ", english: "Nor will I be a worshipper of what you worship." },

  { verse: 93, arabic: "وَلَآ أَنتُمْ عَـٰبِدُونَ مَآ أَعْبُدُ", english: "Nor will you be worshippers of what I worship." },

  { verse: 94, arabic: "لَكُمْ دِينُكُمْ وَلِىَ دِينِ", english: "For you is your religion, and for me is my religion." },

  { verse: 95, arabic: "إِنَّ ٱلَّذِينَ كَفَرُواْ", english: "Indeed, those who disbelieve – never will their wealth or their children avail them against Allah at all, and those are the companions of the Fire; they will abide therein eternally." },

  { verse: 96, arabic: "وَٱلَّذِينَ ءَامَنُواْ وَعَمِلُواْ ٱلصَّـٰلِحَـٰتِ", english: "But those who believe and do righteous deeds – We will admit them to gardens beneath which rivers flow, wherein they abide forever. Allah is pleased with them, and they are pleased with Him. That is for whoever has feared his Lord." },

  { verse: 97, arabic: "إِنَّ ٱلَّذِينَ كَفَرُواْ", english: "Indeed, those who disbelieve and commit wrong [or injustice] – never will Allah forgive them, nor will He guide them to a path." },

  { verse: 98, arabic: "وَٱلَّذِينَ ءَامَنُواْ", english: "But those who believe and do righteous deeds – We will admit them to gardens beneath which rivers flow, wherein they abide forever. Allah is pleased with them, and they are pleased with Him. That is for whoever has feared his Lord." },

  { verse: 99, arabic: "قُلْ يَـٰعِبَادِىَ ٱلَّذِينَ ءَامَنُواْ", english: "Say, 'O My servants who have believed, fear your Lord. For those who do good in this world is good, and the earth of Allah is spacious. Indeed, the patient will be given their reward without account.'" },

  { verse: 100, arabic: "وَلَا تَلْبِسُواْ ٱلْخَبِيثَ", english: "And do not mix the bad with the good or conceal the truth while you know [it]." }
);
alBaqarah.push(
  { verse: 101, arabic: "وَإِذْ قَالَ مُوسَىٰ لِقَوْمِهِ ادْعُوا لِي رَبَّكَ يُهِبْ لِي مِنَ السماءِ مَائِدَةً تَكُونُ لَنَا عِيدًا وَيَأْتِينَا بِزَيْدٍ وَأَخِيهِ فَيُصْلِحَا لَنَا وَيَتَقَبَّلَا اللهَ إِنَّ اللهَ هُوَ الْقَبُولُ الرَّحِيمُ", english: "And when Moses said to his people, 'Call upon your Lord to produce for us from the heaven a table spread with food for us, for it would be a festival for us, and a sign from Allah. And bring us sustenance, for You are the best of sustainers.'" },

  { verse: 102, arabic: "قَالَ إِنِّي نَزَّلْتُهَا عَلَيْكُمْ فَمَن كَفَرَ بَعْدُ مِنكُمْ فَإِنِّي أُعَذِّبُهُ عَذَابًا لَا أُعَذِّبُهُ أَحَدًا مِّنَ الْعَالَمِينَ", english: "Allah said, 'Indeed, I will send it down to you, but whoever disbelieves afterward among you – then indeed, I am severe in penalty.'" },

  { verse: 103, arabic: "وَإِذْ قَالَ مُوسَىٰ لِقَوْمِهِ إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تَذْبَحُوا بَقَرَةً قَالُوا أَتَتَّخِذُنَا هُزُوًا قَالَ أَعُوذُ بِاللَّهِ أَنْ أَكُونَ مِنَ الْجَاهِلِينَ", english: "And when Moses said to his people, 'Indeed, Allah commands you to slaughter a cow.' They said, 'Do you take us in ridicule?' He said, 'I seek refuge in Allah from being among the ignorant.'" },

  { verse: 104, arabic: "قَالُوا ادْعُ لَنَا رَبَّكَ يُبَيِّلْ لَنَا مَا هِيَ ۚ قَالَ إِنَّهَا بَقَرَةٌ لَا فَارِضٌ وَلَا بِكْرٌ عَوَانٌ بَيْنَ ذَلِكَ ۖ فَافْعَلُوا مَا تُؤْمَرُونَ", english: "They said, 'Call upon your Lord to make clear to us what it is.' He said, 'Indeed, it is a cow which is neither old nor virgin, but median between that,' so do what you are commanded.'" },

  { verse: 105, arabic: "قَالُوا ادْعُ لَنَا رَبَّكَ يُبَيِّلْ لَنَا مَا لَوْنُهَا ۖ قَالَ إِنَّهُۥ يَقُولُ إِنَّهَا بَقَرَةٌ صَفْرَاءُ فَاقِعٌ لَّوْنُهَا تَسُرُّ النَّاظِرِينَ", english: "They said, 'Call upon your Lord to show us what is her color.' He said, 'It is a yellow cow, bright in color, pleasing to the observers.'" },

  { verse: 106, arabic: "قَالُوا ادْعُ لَنَا رَبَّكَ يُبَيِّلْ لَنَا مَا هِيَ ۚ إِنَّ الْبَقَرَ تَشَابَهَ عَلَيْنَا وَإِنَّا إِن شَاءَ اللَّهُ لَمُهْتَدُونَ", english: "They said, 'Call upon your Lord to make clear to us what she is, indeed cows look alike to us, and indeed we, if Allah wills, will be guided.'" },

  { verse: 107, arabic: "قَالَ إِنَّهَا بَقَرَةٌ لَّا ذَلُولٌ تَثِيرُ الْأَرْضَ وَلَا تَسْقِي الْحَرْثَ مُسَلَّمَةٌ لَّا شِيَةَ فِيهَا ۖ قَالُوا الْآنَ جِئْتَ بِالْحَقِّ فَذَبَحُوهَا وَمَا كَادُوا يَفْعَلُونَ", english: "He said, 'Indeed, it is a cow neither trained to plow the earth nor to irrigate the field; sound and without blemish.' They said, 'Now you have come with the truth,' so they slaughtered her, but they almost did not." },

  { verse: 108, arabic: "وَإِذْ قَتَلْتُمْ نَفْسًا فَٱدَّارَأْتُمْ فِيهَا وَٱللَّهُ مُخْرِجٌ مَّا كُنتُمْ تَكْتُمُونَ", english: "And when you killed a man and disputed over it, but Allah was to bring out that which you were concealing." },

  { verse: 109, arabic: "فَقُلْنَا اضْرِبُوهُ بِبَعْضِهَا ۖ كَذَٰلِكَ يُحْيِ ٱللَّهُ ٱلْمَوْتَىٰ وَيُرِيكُمْ ءَايَـٰتِهِۦ لَعَلَّكُمْ تَعْقِلُونَ", english: "So We said, 'Strike the body with part of it.' Thus does Allah bring the dead to life and show you His signs that you might reason." },

  { verse: 110, arabic: "ثُمَّ قَسَتْ قُلُوبُكُمْ مِن بَعْدِ ذَٰلِكَ فَهِيَ كَالْحِجَارَةِ أَوْ أَشَدُّ قَسْوَةً ۚ وَإِنَّ مِنَ الْحِجَارَةِ لَمَا يَتَفَجَّرُ مِنْهُ الْأَنْهَارُ ۚ وَإِنَّ مِنْهَا لَمَا يَشَّقَّقُ فَيَخْرُجُ مِنْهُ الْمَاءُ ۚ وَإِنَّ مِنْهَا لَمَا يَهْبِطُ مِنْ خَشْيَةِ اللَّهِ ۗ وَمَا اللَّهُ بِغَافِلٍ عَمَّا تَعْمَلُونَ", english: "Then your hearts became hardened after that, being like stones or even harder. For indeed, there are stones from which rivers gush forth, and there are some of them that split open and water comes out, and there are some of them that fall down for fear of Allah. And Allah is not unaware of what you do." },

  { verse: 111, arabic: "وَإِذْ قُلْتُمْ يَا مُوسَىٰ لَنْ نُؤْمِنَ لَكَ حَتَّىٰ نَرَى اللَّهَ جَهْرَةً فَأَخَذَتْكُمُ الصَّاعِقَةُ وَأَنتُمْ تَنظُرُونَ", english: "And [recall] when you said, 'O Moses, we will never believe you until we see Allah outright'; so the thunderbolt took you while you were looking on." },

  { verse: 112, arabic: "ثُمَّ أَحْيَاكُم مِّن بَعْدِ مَوْتِكُمْ لَعَلَّكُمْ تَشْكُرُونَ", english: "Then We revived you after your death that you might be grateful." },

  { verse: 113, arabic: "وَلَقَدْ كَفَرَ الَّذِينَ قَالُوا إِنَّ اللَّهَ هُوَ الْمَسِيحُ ابْنُ مَرْيَمَ ۖ وَقَالَ الْمَسِيحُ يَا بَنِي إِسْرَائِيلَ اعْبُدُوا اللَّهَ رَبِّي وَرَبَّكُمْ ۖ إِنَّهُ مَن يُشْرِكْ بِاللَّهِ فَقَدْ حَرَّمَ اللَّهُ عَلَيْهِ الْجَنَّةَ وَمَأْوَاهُ النَّارُ ۖ وَمَا لِلظَّالِمِينَ مِن نَّصِيرٍ", english: "And they certainly disbelieve who say that Allah is the Messiah, the son of Mary. Say, 'Then who could prevent Allah at all if He had intended to destroy the Messiah, the son of Mary, or his mother or everyone on the earth?' And to Allah belongs the dominion of the heavens and the earth and whatever is between them. He creates what He wills, and Allah is over all things competent." },

  { verse: 114, arabic: "وَقَالُوا اتَّخَذَ اللَّهُ وَلَدًا ۖ سُبْحَانَهُ ۖ بَلْ لَهُ مَا فِي السَّمَاوَاتِ وَالْأَرْضِ ۗ كُلٌّ لَّهُ قَانِتُونَ", english: "And they say, 'Allah has taken a son.' Exalted is He! Rather, to Him belongs whatever is in the heavens and the earth. All are devoutly obedient to Him." },

  { verse: 115, arabic: "تِلْكَ أَدْعِيَاءُهُمْ بِالْبَاطِلِ وَمَا هُم بِمُلَقَّي الْعَذَابِ", english: "Originators of falsehood; and they will not succeed." },

  { verse: 116, arabic: "قُلْ إِن كَانَ لِلرَّحْمَنِ وَلَدٌ فَأَنَا أَوَّلُ الْعَابِدِينَ", english: "Say, 'If the Most Merciful had a son, then I would be the first of [his] worshippers.'" },

  { verse: 117, arabic: "سُبْحَانَهُ ۖ بَلْ عِبَادٌ مُّكْرَمُونَ", english: "Exalted is He; rather, [He is] worshipped by those who are near [to Him]." },

  { verse: 118, arabic: "لَا يَسْبِقُونَهُ بِالْقَوْلِ وَهُمْ بِأَمْرِهِ يَعْمَلُونَ", english: "They do not precede Him in word, and they act by His command." },

  { verse: 119, arabic: "يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ", english: "He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great." },

  { verse: 120, arabic: "وَلَا يَأْتِيهِم مِّنْ نَّبَإٍ مِّنَ الْغَيْبِ إِلَّا وَهُوَ يَسْمَعُهُ ۚ وَهُم مِّنْهُ مُشْفِقُونَ", english: "And never comes to them any news of the unseen but that he hears it. And they are enveloped by what they fear." }
);
const alBaqarah_121_140 = [
  { verse: 121, arabic: "ٱلَّذِينَ ءَاتَيْنَهُمُ ٱلْكِتَـٰبَ يَتْلُونَهُۥ حَقَّ تِلَـٰوَتِهِۦٓ", english: "Those to whom We have given the Scripture recite it with its true recital." },
  { verse: 122, arabic: "يَـٰبَنِىٓ إِسْرَٰٓءِيلَ ٱذْكُرُواْ نِعْمَتِىَ ٱلَّتِىٓ أَنْعَمْتُ عَلَيْكُمْ", english: "O Children of Israel, remember My favor that I have bestowed upon you..." },
  { verse: 123, arabic: "وَٱتَّقُواْ يَوْمًا لَّا تَجْزِى نَفْسٌۭ عَن نَّفْسٍۢ شَيْـًۭٔا وَلَا يُقْبَلُ مِنْهَا شَفَـٰعَةٌۭ وَلَا يُؤْخَذُ مِنْهَا عَدْلٌۭ وَلَا هُمْ يُنصَرُونَ", english: "And fear a Day when no soul will suffice for another at all..." },
  { verse: 124, arabic: "وَإِذِ ٱبْتَلَىٰٓ إِبْرَٰهِيمَ رَبُّهُۥ بِكَلِمَـٰتٍۢ فَأَتَمَّهُنَّ", english: "And [mention, O Muhammad], when Abraham was tried by his Lord with commands..." },
  { verse: 125, arabic: "وَإِذْ جَعَلْنَا ٱلْبَيْتَ مَثَـٰبَةًۭ لِّلنَّاسِ وَأَمْنًۭا", english: "And [mention] when We made the House a place of return for the people..." },
  { verse: 126, arabic: "وَإِذْ يَرْفَعُ إِبْرَٰهِيمُ ٱلْقَوَاعِدَ مِنَ ٱلْبَيْتِ وَإِسْمَـٰعِيلُ", english: "And [mention] when Abraham and Ishmael were raising the foundations of the House..." },
  { verse: 127, arabic: "وَإِذْ يَرْفَعُ إِبْرَٰهِيمُ ٱلصَّلَوٰةَ وَٱلْإِنسَـٰنُ يَدْعُوهُ", english: "And [mention] when Abraham was raising the prayer and Ishmael..." },
  { verse: 128, arabic: "رَبَّنَا ٱجْعَلْنَا مُسْلِمَيْنِ لَكَ وَمِن ذُرِّيَّتِنَآ", english: "Our Lord, make us Muslims [in submission] to You and [raise] from our descendants..." },
  { verse: 129, arabic: "رَبَّنَا وَٱرْزُقْنَا مِن لَّدُنكَ وَلِيًّا وَٱجْعَلْ لَنَا مِن لَّدُنكَ نَصِيرًا", english: "Our Lord, and provide for us from Yourself a protector and make for us from Yourself a helper." },
  { verse: 130, arabic: "وَلَا تَجْعَلْ فِى قُلُوبِنَا غِلًّا لِّلَّذِينَ ءَامَنُواْ", english: "And do not place in our hearts any resentment toward those who have believed..." },
  { verse: 131, arabic: "رَبَّنَآ إِنَّكَ جَامِعُ ٱلنَّاسِ لِيَوْمٍۢ لَّا رَيْبَۛ فِيهِ", english: "Our Lord, indeed You will gather the people for a Day about which there is no doubt..." },
  { verse: 132, arabic: "وَقَالَ ٱلْمَلَـٰٓئِكَةُ ٱئْتِ بِإِبْرَٰهِيمَ قَوِيمًاۭ", english: "And the angels said, 'O Abraham, submit [to Allah]...' " },
  { verse: 133, arabic: "وَذَرُواْ فِى هَـٰذِهِ ٱلْقَرْيَةِ ٱلْكَـٰفِرِينَ", english: "And leave those who have taken their religion as amusement and diversion..." },
  { verse: 134, arabic: "قَالُواْ يَـٰٓإِبْرَٰهِيمُ تَرِكْتَ أَهْلَكَ", english: "They said, 'O Abraham, what is this that you have left your people...'" },
  { verse: 135, arabic: "قَالُواْ أَتَتَّخِذُونَ أَصْنَـٰمًآ", english: "They said, 'Do you take idols as deities? Indeed, we see you and your people to be in manifest error.'" },
  { verse: 136, arabic: "قَالُواْ بَلْ فَعَلُواْ ءَالِهَةًۭ مُّسْتَقْرَّةًۭ", english: "They said, 'Rather, we found our forefathers doing so.'" },
  { verse: 137, arabic: "وَلَوْلَا كَلِمَةٌۭ سَبَقَتْ مِن رَّبِّكَ", english: "And if not for a word that preceded from your Lord, it would have been for them..." },
  { verse: 138, arabic: "لِلَّهِ مَن فِى ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ", english: "To Allah belongs whoever is in the heavens and the earth..." },
  { verse: 139, arabic: "قَالُواْ ٱتَّخَذَ ٱلَّهُ وَلَدًا", english: "They said, 'Has Allah taken a son?'" },
  { verse: 140, arabic: "لَقَدْ جِئْتُمْ شَيْـًٔا إِدًّا", english: "You have certainly come with evil accusation." }
];
