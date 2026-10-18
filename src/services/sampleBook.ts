import { StoredBook } from '../types/reader';

export const SAMPLE_BOOK: StoredBook = {
  metadata: {
    id: 'sample-the-time-machine',
    title: 'The Time Machine',
    author: 'H. G. Wells',
    pageCount: 38,
    totalWords: 7240,
    sectionCount: 4,
    dateAdded: Date.now(),
    lastReadTime: Date.now(),
    coverColor: '#854d0e',
  },
  toc: [
    { id: 'ch-1', title: 'Chapter I: The Scientific Principle', sectionIndex: 0, pageNumber: 1 },
    { id: 'ch-2', title: 'Chapter II: The Model Machine', sectionIndex: 1, pageNumber: 10 },
    { id: 'ch-3', title: 'Chapter III: Through the Dimensions', sectionIndex: 2, pageNumber: 20 },
    { id: 'ch-4', title: 'Chapter IV: The Golden Age of 802,701 AD', sectionIndex: 3, pageNumber: 30 },
  ],
  sections: [
    {
      id: 'section-0',
      index: 0,
      title: 'Chapter I: The Scientific Principle',
      pageStart: 1,
      pageEnd: 9,
      wordCount: 1840,
      paragraphs: [
        { type: 'heading', text: 'CHAPTER I' },
        { type: 'subheading', text: 'The Scientific Principle' },
        {
          type: 'paragraph',
          text: 'The Time Traveller (for so it will be convenient to speak of him) was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated. The fire burnt brightly, and the soft radiance of the incandescent lights in the lilies of silver caught the bubbles that flashed and passed in our glasses.',
        },
        {
          type: 'paragraph',
          text: 'Our chairs, being his patents, embraced and caressed us rather than submitted to be sat upon, and there was that luxurious after-dinner atmosphere when thought roams gracefully free of the trammels of precision. And he put it to us in this way—marking the points with a lean forefinger—as we sat and lazily admired his earnestness over this new paradox (as we thought it) and his fecundity.',
        },
        {
          type: 'quote',
          text: '"You must follow me carefully. I shall have to controvert one or two ideas that are almost universally accepted. The geometry, for instance, they taught you at school is founded on a misconception."',
        },
        {
          type: 'paragraph',
          text: '"Is not that rather a large thing to expect us to begin upon?" said Filby, an argumentative person with red hair.',
        },
        {
          type: 'paragraph',
          text: '"I do not mean to ask you to accept anything without reasonable ground for it. You will soon admit as much as I need from you. You know of course that a mathematical line, a line of thickness nil, has no real existence. They taught you that? Neither has a mathematical plane. These things are mere abstractions."',
        },
        {
          type: 'paragraph',
          text: '"That is all right," said the Psychologist.',
        },
        {
          type: 'paragraph',
          text: '"Nor, having only length, breadth, and thickness, can a cube have a real existence."',
        },
        {
          type: 'paragraph',
          text: '"There I object," said Filby. "Of course a solid body may exist. All real things—"',
        },
        {
          type: 'paragraph',
          text: '"So most people think. But wait a moment. Can an instantaneous cube exist?"',
        },
        {
          type: 'paragraph',
          text: '"Don\'t follow you," said Filby.',
        },
        {
          type: 'paragraph',
          text: '"Can a cube that does not last for any time at all, have a real existence?" Filby became pensive. "Clearly," the Time Traveller proceeded, "any real body must have extension in four directions: it must have Length, Breadth, Thickness, and—Duration."',
        },
        {
          type: 'paragraph',
          text: '"By a natural infirmity of the flesh, which I will explain to you in a moment, we incline to overlook this fact. There are really four dimensions, three which we call the three planes of Space, and a fourth, Time. There is, however, a tendency to draw an unreal distinction between the former three dimensions and the latter, because it happens that our consciousness moves intermittently along the latter from the beginning to the end of our lives."',
        },
        {
          type: 'paragraph',
          text: '"That," said a very young man, making spasmodic efforts to relight his cigar over the lamp; "that . . . very clear indeed."',
        },
        {
          type: 'paragraph',
          text: '"Now, it is very remarkable that this is so extensively overlooked," continued the Time Traveller, with a slight accession of cheerfulness. "Really this is what is meant by the Fourth Dimension, though some people who talk about the Fourth Dimension do not know they mean it. It is only another way of looking at Time."',
        },
        {
          type: 'paragraph',
          text: '"There is no difference between Time and any of the three dimensions of Space except that our consciousness moves along it. But some foolish people have got hold of the wrong side of that idea. You have all heard what they have to say about this Fourth Dimension?"',
        },
        {
          type: 'paragraph',
          text: '"I have not," said the Provincial Mayor.',
        },
        {
          type: 'paragraph',
          text: '"It is simply this. That Space, as our mathematicians have it, is spoken of as having three dimensions, which one may call Length, Breadth, and Thickness, and is always definable by reference to three planes, each at right angles to the others. But some philosophical people have been asking why three dimensions particularly—why not another direction at right angles to the other three?—and have even tried to construct a Four-Dimensional geometry."',
        },
      ],
    },
    {
      id: 'section-1',
      index: 1,
      title: 'Chapter II: The Model Machine',
      pageStart: 10,
      pageEnd: 19,
      wordCount: 1720,
      paragraphs: [
        { type: 'heading', text: 'CHAPTER II' },
        { type: 'subheading', text: 'The Model Machine' },
        {
          type: 'paragraph',
          text: 'The thing the Time Traveller held in his hand was a glittering metallic framework, scarcely larger than a small clock, and very delicately made. There was ivory in it, and some transparent crystalline substance. And now I must be plain, for what followed, unless his explanation is to be accepted, is an absolutely unaccountable thing.',
        },
        {
          type: 'paragraph',
          text: 'He took one of the small octagonal tables that were scattered about the room, and set it in front of the fire, with two legs on the hearthrug. On this table he placed the mechanism. Then he drew up a chair, and sat down. The only other object on the table was a small shaded lamp, the bright light of which fell full upon the model.',
        },
        {
          type: 'paragraph',
          text: 'There were also perhaps a dozen candles about, two in brass candlesticks upon the mantel and several in sconces, so that the room was brilliantly illuminated. I sat in a low armchair nearest the fire, and I drew this forward so as to be almost between the Time Traveller and the fireplace.',
        },
        {
          type: 'quote',
          text: '"This little affair," said the Time Traveller, resting his elbows upon the table and pressing his hands together above the apparatus, "is only a model. It is my plan for a machine to travel through time."',
        },
        {
          type: 'paragraph',
          text: '"You will notice that it looks singularly askew, and that there is an odd twinkling appearance about this bar, as though it were in some way unreal." He pointed to the part with his finger. "Also, here is one little white lever, and here is another."',
        },
        {
          type: 'paragraph',
          text: 'The Medical Man got up out of his chair and peered into the thing. "It\'s beautifully made," he said. "It took two years to make," retorted the Time Traveller. Then, when we had all imitated the Medical Man, he said: "Now I want you clearly to understand that this lever, being pressed over, sends the machine gliding into the future, and this other reverses the motion."',
        },
        {
          type: 'paragraph',
          text: 'This saddle represents the seat of a time traveller. Presently I am going to press the lever, and off the machine will go. It will vanish, pass into future Time, and disappear. Have a good look at the thing. Look at the table too, and satisfy yourselves there is no trickery. I don\'t want to waste this model, and then be told I\'m a quack."',
        },
        {
          type: 'paragraph',
          text: 'There was a minute\'s pause perhaps. The Psychologist seemed about to speak to me, but changed his mind. Then the Time Traveller put forth his finger towards the lever. "No," he said suddenly. "Lend me your hand." And turning to the Psychologist, he took that individual\'s hand in his own and told him to put out his forefinger.',
        },
        {
          type: 'paragraph',
          text: 'So it was the Psychologist himself who sent that model Time Machine on its interminable voyage. We all saw the finger press the lever. I am absolutely certain there was no deception. There was a breath of wind, and the lamp flame jumped. One of the candles on the mantel was blown out, and the little machine suddenly swung round, became indistinct, was seen as a ghost for a second perhaps, as an eddy of faintly glittering brass and ivory; and it was gone—vanished into thin air!',
        },
      ],
    },
    {
      id: 'section-2',
      index: 2,
      title: 'Chapter III: Through the Dimensions',
      pageStart: 20,
      pageEnd: 29,
      wordCount: 1690,
      paragraphs: [
        { type: 'heading', text: 'CHAPTER III' },
        { type: 'subheading', text: 'Through the Dimensions' },
        {
          type: 'paragraph',
          text: 'I told some of you last Thursday of the principles on which the machine was made, and showed the actual thing itself, incomplete in the workshop. There it is now, a little travel-worn, truly; and one of the ivory bars is cracked, and a brass rail bent; but the rest of it is sound enough.',
        },
        {
          type: 'paragraph',
          text: 'I expected to finish it on Friday, but on Friday, when the putting together was nearly done, I found that one of the nickel bars was exactly one inch too short, and this I had to get remade; so that the thing was not complete until this morning. It was at ten o\'clock today that the first of all Time Machines began its career.',
        },
        {
          type: 'paragraph',
          text: 'I gave it a last check, tried all the screws again, put one more drop of oil on the quartz rod, and sat myself in the saddle. I suppose a suicide who holds a revolver to his skull holds much the same wonder at what will come next as I felt then.',
        },
        {
          type: 'paragraph',
          text: 'I took the starting lever in one hand and the stopping one in the other, pressed the first, and almost immediately the second. I seemed to reel; I felt a nightmare sensation of falling; and, looking round, I saw the laboratory exactly as before. Had anything happened? For a moment I suspected that my intellect had tricked me.',
        },
        {
          type: 'paragraph',
          text: 'Then I noted the clock. A moment before, as it seemed, it had stood at a minute or so past ten; now it was nearly half-past three! I drew a breath, set my teeth, gripped the starting lever with both hands, and went off with a thud.',
        },
        {
          type: 'paragraph',
          text: 'The night came like the turning out of a lamp, and in another moment came tomorrow. The laboratory grew faint and hazy, then fainter and ever fainter. Tomorrow night came black, then day again, night again, day again, faster and faster still. An eddying murmur filled my ears, and a strange, dumb confusion descended upon my mind.',
        },
        {
          type: 'paragraph',
          text: 'I am afraid I cannot convey the peculiar sensations of time travelling. They are excessively unpleasant. There is a feeling exactly like that one has upon a switchback—of a helpless headlong motion! I felt the same horrible anticipation, too, of an imminent smash. As I put on pace, night followed day like the flapping of a black wing.',
        },
      ],
    },
    {
      id: 'section-3',
      index: 3,
      title: 'Chapter IV: The Golden Age of 802,701 AD',
      pageStart: 30,
      pageEnd: 38,
      wordCount: 1990,
      paragraphs: [
        { type: 'heading', text: 'CHAPTER IV' },
        { type: 'subheading', text: 'The Golden Age of 802,701 AD' },
        {
          type: 'paragraph',
          text: 'In another moment I was in a fine hall, with a great carved portal leading to a garden. The roof was painted with floral decorations, and the floor was of a smooth, white stone, adorned with mosaics of porphyry and serpentine. In this hall were a number of tables made of polished stone, upon which were large baskets of fruits, some familiar to me, though remarkably magnified, and others wholly strange.',
        },
        {
          type: 'paragraph',
          text: 'My little friends gathered around me, chattering in sweet liquid voices like birds. They seemed to have no interest in my machine; their childlike minds flitted from one wonder to the next with effortless grace. They offered me fruits, and I ate greedily, for I was ravenous after my voyage across eight hundred thousand years.',
        },
        {
          type: 'paragraph',
          text: 'When I had eaten, I went out into the glorious sunlight. The landscape was breathtaking: huge arching palaces, overgrown with vivid climbing flora, dotted the wide lush valleys. There were no hedges, no signs of agriculture or property boundaries; the entire earth seemed to have been turned into a tranquil, harmonious garden.',
        },
        {
          type: 'paragraph',
          text: 'Communism, I thought to myself, had been achieved. Disease had been stamped out, nature conquered, and humanity had relaxed into a state of graceful, perpetual childhood. But how little did I anticipate the dark secret that lurked beneath the lush pastures—the dreadful night-dwellers whom I was soon to encounter in the lightless underworld below!',
        },
      ],
    },
  ],
};
