//Initiate current status chore array

var choreList = ['trash', 'dishes', 'bathroom', 'floors/surfaces', 'tech crunch', 'fridge'];
var descriptList = [];
descriptList[0] = 'Take trash from the kitchen, living room, and bathroom to the curb';
descriptList[1] = 'Clean the pots and pans, run the dishwasher, dry the dishes, and put them away';
descriptList[2] = 'Clean the floor, sink, and bathtub. Don\'t forget the toilet!';
descriptList[3] = 'Vacuum common area floors in the living room and surfaces in the dining room and kitchen';
descriptList[4] = 'Check Tech Crunch and Tech Crunch TV for the latest in technology news';
descriptList[5] = 'Throw out expired foods, clean drawers and shelves, and make sure the lighbulb\'s working';

var chores = [];

for(var i = 0; i<choreList.length; i++){
  chores[i] = {
    id: i,
    name: choreList[i],
    description: descriptList[i],
    status: 'unassigned',
    timeAssigned: null,
    timeCompleted: null,
    selected: false,
    assignee: null,
    picture: null
  };
}

module.exports = chores;
