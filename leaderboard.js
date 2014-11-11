// Create a MongoDB Collection
PlayersList = new Mongo.Collection('players');

// Code that only runs on the client (within the web browser)
if(Meteor.isClient){

  Meteor.subscribe('thePlayers');
  // Helper functions execute code within templates
  Template.leaderboard.helpers({
    'player': function(){

        // Retrieve all of the data from the "PlayersList" collection
        return PlayersList.find({}, {sort: {score: -1, name: 1} })

    },
    'selectedClass': function(){

        // Get the ID of the player being iterated through
        var playerId = this._id;

        // Get the ID of the player that's been clicked
        var selectedPlayer = Session.get('selectedPlayer');

         // Do these IDs match?
        if(playerId == selectedPlayer){

            // Return a CSS class
            return "selected"

        }

    },
    'showSelectedPlayer': function(){

      // Get the ID of the player that's been clicked
      var selectedPlayer = Session.get('selectedPlayer');

      // Retrieve a single document from the collection
      return PlayersList.findOne(selectedPlayer)

    }
  });

  // Events trigger code when certain actions are taken
  Template.leaderboard.events({
      'click .player': function(){

          // Retrieve the unique ID of the player that's been clicked
          var playerId = this._id;

          // Create a session to store the unique ID of the clicked player
          Session.set('selectedPlayer', playerId);

      },
      'click .increment': function(){

        // Get the ID of the player that's been clicked
        var selectedPlayer = Session.get('selectedPlayer');

        // Update a document and increment the score field by 5
        Meteor.call('modifyPlayerScore', selectedPlayer, 5);

      },
      'click .decrement': function(){

        // Get the ID of the player that's been clicked
        var selectedPlayer = Session.get('selectedPlayer');

        // Update a document and decrement the score field by 5
        Meteor.call('modifyPlayerScore', selectedPlayer, -5);
      },
      'click .remove': function(){

        // Get the ID of the player that's been clicked
        var selectedPlayer = Session.get('selectedPlayer');

        // Remove a document from the collection
        Meteor.call('removePlayerData', selectedPlayer);

      }
  });

  Template.addPlayerForm.events({
    'submit form': function(event){
        event.preventDefault();
        playerNameVar = event.target.playerName.value;
        Meteor.call('insertPlayerData', playerNameVar);
    }
  });

}

// Code that only runs on the server (where the application is hosted)
if(Meteor.isServer){
  Meteor.publish('thePlayers', function(){
    return PlayersList.find({createdBy: this.userId});
  });

  Meteor.methods({
    'insertPlayerData': function(playerNameVar){
      PlayersList.insert({
        name: playerNameVar,
        score: 0,
        createdBy: Meteor.userId()
      });
    },
    'removePlayerData': function(selectedPlayer){
      PlayersList.remove(selectedPlayer);
    },
    'modifyPlayerScore': function(selectedPlayer, scoreValue){
      PlayersList.update(selectedPlayer, { $inc: {score: scoreValue} });
    }
  });
}