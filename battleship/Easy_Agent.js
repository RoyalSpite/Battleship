import { ships } from "./util_functions.js"

export class Random_AI{

    constructor(){

        this.x = undefined
        this.y = undefined
        this.time = 0
        this.shot = 0
        
        this.player_ships_remaining = [...ships]
    }

    choose_target(board){

        //targeting algorithm
        while(true){

          this.x  = Math.floor(Math.random() * 8)
          this.y = Math.floor(Math.random() * 8)

          if(board[ this.y ][ this.x ] >= 0){
            this.shot++
            break
            }

        }

    }

    getFeedback(state,board){

        if(state.result === 2){
            this.player_ships_remaining.splice(this.player_ships_remaining.indexOf(state.shipData.block),1)
        }

    }

}