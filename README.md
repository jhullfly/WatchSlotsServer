#Server for watch slots

##Balance
Gets the balance.

    http://watchslots.herokuapp.com/balance/<identifierForVendor>
returns

    {
       success:true,
       balance:<value>
    }

##Spin
Spins and returns reel positions and new balance.

    http://watchslots.herokuapp.com/spin/<identifierForVendor>/<betAmount>
returns

    {
       success:true,
       newBalance:<value>,
       reels:[<reel1>,<reel2>,<reel3>],
       winnings:<amount>
    }

[Here is the mapping from symbols numbers to icons](https://docs.google.com/spreadsheets/d/1EIwJ8qcnRFuYcc4vK6XQ0hKZy5CotDUIP71k2GfzZNE/edit#gid=0)

##Todo

* add daily return bonus
* add support for facebook integration

