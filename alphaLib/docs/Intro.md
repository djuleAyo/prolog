# Intro


## Trees 🌳

### Basic usage

```
Mark
  Anthony
  John
    Andrew
```

Here we have defined a tree. It's human readable. If two lines are on the same level of indentation they are siblings. +1 is direct descendant.

Trees come with familiar **tree terminology**.
* son
* father
* ancestor
* descendant
* siblings
* branch
* root

Before proceeding make sure you are familiar with these.

**Let's add some sugar 🍩**

```
root
  leaf1
  leaf2

% can be written as
root
  leaf1 leaf2

% or
root/ leaf1 leaf2

% or even

root/ leaf[1..2]
%
```

Few things to notice here:
* All of these are equivalent
* Examples are applicable only if no need to specify further generations.

Just like in an editor, solitary paths can be condensed like
```
ancestor/father
  son[1..3]
```

### Forest

Many trees make a forest.

**Forest example**
```
animal
  mammal
    cannaine
      dog
      fox
    cat
  fish
  bird

character
  teritorial
  loyal
  stubborn
  selfAbsorbed

breedOrigin
  england
  france
  hungary
  serbia

```