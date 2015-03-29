#Server for watch slots

##Balance
Gets the balance and indicates if a return bonus is available but does not award it.

    http://watchslots.herokuapp.com/balance/<identifierForVendor>
returns

    {
       success:true,
       balance:<value>,
       bonusWaiting:<true|false>
       nextBonus:<date>,
    }

nextBonus is only there when bonusWaiting is false.

##balanceWithRBAward
Gets the balance and awards return bonus if it is time.

    http://watchslots.herokuapp.com/balanceWithRBAward/<identifierForVendor>
returns

    {
       success:true,
       balance:<value>,
       nextBonus:<date>,
       returnBonus : {
        wheelPosition: <value:1-8>,
        winnings: <value>
        afterBonusBalance: <value>
       }
    }

the return bonus section is optional and only occurs if the bonus was awarded.


##Spin
Spins and returns reel positions and new balance.

    http://watchslots.herokuapp.com/spin/<identifierForVendor>/<betAmount>
returns

    {
       success:true,
       newBalance:<value>,
       reels:[<reel1>,<reel2>,<reel3>],
       winnings:<amount>,
       nextBonus:<date>,
       returnBonus : {
        wheelPosition: <value:1-8>,
        winnings: <value>
        afterBonusBalance: <value>
       }
    }

the return bonus section is optional and only occurs if the bonus was awarded.

[Here is the mapping from symbols numbers to icons](https://docs.google.com/spreadsheets/d/1EIwJ8qcnRFuYcc4vK6XQ0hKZy5CotDUIP71k2GfzZNE/edit#gid=0)

##Purchase
Increases users token balance due to a purchase. Will eventually verify receipt with apple.

    curl -X POST \
       -H "Content-Type: application/json" \
       -d '{"quantity":100,"transactionId":"foo", receipt:"<base64encodedString>"}' \
       http://watchslots.herokuapp.com/purchase/<identifierForVendor>

returns:

    {
       success:true,
       newBalance:<value>
    }

## Admin functions

TODO: some way to restrict these.

###resetReturnBonus
Sets the users last return bonus to 1 day ago. So next spin will trigger a return bonus.

    http://watchslots.herokuapp.com/admin/resetReturnBonus/<identifierForVendor>

###setOutcome
Sets the users outcome on the slot machine until it is cleared.

    http://watchslots.herokuapp.com/admin/setOutcome/<identifierForVendor>/<outcome>

outcome - should be 1-8 or clear to return to random behavior

###setBalance
Sets the users balance

    http://watchslots.herokuapp.com/admin/setBalance/<identifierForVendor>/<balance>


##Todo

* add daily return bonus: for get balance
* add support for facebook integration

