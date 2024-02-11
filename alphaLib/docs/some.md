# Something entierly new

## What?

OOP had an idea - object and its methods. And inheritance. Hierachical polymorphism
But lets disallow multiple inheritance, because problems. Lets introduce interfaces
Then play arround inheritance and end up with complexity in desing

So scala, rust followed haskels steps with traits! Trait, sadly, is empty class.
As such a trait, an empty class, can trivialy inherit another trait. So basicaly
traits are word hierarchies! Taxonomies. Now these taxonomies allow multiple
inheritance and since there is no order of construction, diamond problem doesn't
exist.

With multiple taxonomies - trait inheritance trees we can label - or trivially
implement our classes. And all this is checked by compiler statically.
In essence **structural labeling** in contrast to simple labeling allows us to
more or less create word index of objects - a data index consisted of simple words.
Each word can be disambiguated by its path and each data node can be labeled
by multiple labels. So akin to what we do statically with traits we can do dynamically
to create this word data index with all its nice properties

So what we end up with is multiple trees - taxonomies, multiple categorizations
and documents sorted out in these cotegorizations. Categorizations are dynaminc
and each corresponds to a query language. So as data grows, so do the languages
needed to refrence all objects of the data. This leads to organic grow, and absolute
reusability of each taxonomy, over porject or even data types.

The biggest beauty of this is that each taxonomy can be specified seperately and
like this step by step we can narrow down any search with visual aid of both
taxonomies and in each step all unused taxonomies are eliminated.

This also provides great data visualization power - I rememebered I want a photo from Spain
automatically the system provides me details of all the persons I have a photo with with Spain
all the cities I visited in Spain and so on.

Such a system, multicategorization system, completly changes how
file system approaches the problem forcing us to project what essentialy is
data multicategorization into one tree and as a result always stays messy.

In its essence word data index achieved through multicategorization provides
* deterministic
* interactive
* associative
* personal
data search

**Deterministic**
Each tree provieds relations between words so each word can be dismabiguated
and like this we can with simple path syntax and logical operators construct
very powerful queries. All based on data it self because categorizations them selfs
are data. This means no loss of control as AI services often silently charm you 
to accept. You get what you are looking for and exactly this. No marketing, no mistakes

**interactive**
On each steap of a search system can deduce all applicable categorizations
and hint their roots as further associations and data analitics of the currently
selected query

**associative**
nominal referencing, as programmers know, is, well not so great.
Names are contextual thing, so with change of context, a name should be simplified
or expanded
names are personal thing. If I love you I have a nickname for you,...
Chance of name collisions grows exponentionally. Did you ever try to make a character
in a popular game?
Associative refrencing is user centric experience that we were outh to have long ago
but today with growing need to manipulate ever increasing amounts of data
it is needed more then ever

**personal**
each person can have their own language of associations even over the same set of data.
Long live multidisciplinary collaboration


