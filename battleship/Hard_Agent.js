import { Hunt_and_Target_AI } from "./Normal_Agent.js";
import { gridnum } from "./util_functions.js"

export class Probabilistic_Agent extends Hunt_and_Target_AI{

    constructor(){
        super()

        this.probMap = [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
        ]

        this.ships_set = [...this.player_ships_remaining.filter((value, index, self) => self.indexOf(value) === index)]
        this.possible_targets = []
    }

    choose_target(board){

        if(this.mode !== "CLOSE"){

            this.possible_targets = []

            const maxRow = this.probMap.map((row) => { return Math.max.apply(Math, row) })
            const maxBoard = Math.max.apply(null, maxRow);

            for(let i=0;i<gridnum;i++){
                for(let j=0;j<gridnum;j++){
                    if(this.probMap[i][j] === maxBoard){
                        this.possible_targets.push({
                            x : j,
                            y : i
                        })
                    }
                }
            }

            while(true){
                const pos = Math.floor( Math.random() * this.possible_targets.length )
                const selected_pos = this.possible_targets[ pos ]
                //console.log("select "+selected_pos.x+","+selected_pos.y)
                if(board[ selected_pos.y ][ selected_pos.x ] > -1){
                    this.x = selected_pos.x
                    this.y = selected_pos.y
                    this.shot++
                    break
                }
            }

        }

    }

    getProbMap(board){

        const probMap = [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
        ]

        if(this.mode === "HUNT"){

            for(let i=0;i<this.ships_set.length;i++){
        
                const shiplen = this.ships_set[i] - 1
                
                //check vertical
                for(let y=0;y<gridnum;y++){
        
                    for(let x=0;x<gridnum;x++){
    
                        const startPoint = { x : x, y : y }
                        const endPoint = { x : x , y : (y + shiplen) }
    
                        this.fillProbMab(startPoint,endPoint,board,probMap)
    
                    }
    
                }
        
                //check horizontal
                if(shiplen > 0){
                    for(let x=0;x<gridnum;x++){
        
                        for(let y=0;y<gridnum;y++){
        
                            const startPoint = {x : x, y : y}
                            const endPoint = {x : (x + shiplen), y : y }
        
                            this.fillProbMab(startPoint,endPoint,board,probMap)
        
                        }
        
                    }
                }
        
            }
            
        }
        else if(this.mode === "TARGET"){

            // console.log("prev")
            // for(let i=0;i<this.prev.length;i++) console.log(this.prev[i])
            
            // console.log("board")
            // for(let i=0;i<board.length;i++){
            //     console.log(board[i])
            // }
            for(let i=0;i<this.prev.length;i++){

                for(let j=0;j < this.ships_set.length ; j++){
    
                    const shiplen = this.ships_set[j] - 1
                    //console.log("prev "+this.prev[i].x+","+this.prev[i].y)

                    const startPoints = [
                        { x : this.prev[i].x            , y : this.prev[i].y + 1 },
                        { x : this.prev[i].x            , y : this.prev[i].y - shiplen },
                        { x : this.prev[i].x + 1        , y : this.prev[i].y },
                        { x : this.prev[i].x - shiplen  , y : this.prev[i].y }
                    ]

                    const endPoints = [
                        { x : this.prev[i].x            , y : this.prev[i].y + shiplen },
                        { x : this.prev[i].x            , y : this.prev[i].y - 1 },
                        { x : this.prev[i].x + shiplen  , y : this.prev[i].y },
                        { x : this.prev[i].x - 1        , y : this.prev[i].y }
                    ]

                    for(let k=0;k<4;k++){
                        this.fillProbMab(startPoints[k],endPoints[k],board,probMap)
                    }
                   
                }

            }

            for(let i=0;i<this.prev.length;i++) probMap[this.prev[i].y][this.prev[i].x] = 0

        }
    
        // console.log("prob Map")
        //for(let i=0;i<probMap.length;i++) console.log(probMap[i])
        //for(let i=0;i<probMap.length;i++)
        

        this.probMap = probMap
        
    }

    getFeedback(state,board){

        if(state.result === 0){
            //MISS
            //console.log("miss")

        }
        else if(state.result > 0){

            this.addPrevPath()

            if(state.result === 1){

                //HIT
                if(this.mode === "HUNT"){
                    this.mode = "TARGET"
                }

            }
            else if(state.result === 2){
                //SINK
    
                // console.log("prev (before slice)  ---")
                // for(let i=0;i<this.prev.length;i++) console.log(this.prev[i])
    
                this.clearTraveledPath(state.shipData)
            
                // console.log("prev (after slice)  ---")
                // for(let i=0;i<this.prev.length;i++) console.log(this.prev[i])
    
                //UPDATE KNOWLEDGE
                this.player_ships_remaining.splice(this.player_ships_remaining.indexOf(state.shipData.block),1)

            }

        }

        if(this.prev.length === 0){
            this.mode = "HUNT"
        }

        if(this.player_ships_remaining.length === 0) this.mode = "CLOSE"
        else{
            if(this.shot >= 1) this.getProbMap(board)
        }

    }

    fillProbMab(startPoint,endPoint,board,probMap){
    
        if(!(
            this.checkInRange(0,gridnum-1,startPoint.x) && this.checkInRange(0,gridnum-1,startPoint.y) &&
            this.checkInRange(0,gridnum-1,endPoint.x) && this.checkInRange(0,gridnum-1,endPoint.y))
        ){
            return
        }

        // console.log(startPoint)
        // console.log(endPoint)

        for(let y=startPoint.y ; y<=endPoint.y ; y++){
            for(let x=startPoint.x ; x<=endPoint.x ; x++){
                
                if((board[y][x] === -1) ){
                    //console.log("cannot  place ship with length "+(len+1)+" in ("+x+","+y+").")
                    return
                }
            }
        }

        let weight = 1
        for(let y=startPoint.y ; y<=endPoint.y ; y++){
            for(let x=startPoint.x ; x<=endPoint.x ; x++){
                // if(prevPoint !== undefined){
                //     if(Math.abs(prevPoint.x - x) === 1 && Math.abs(prevPoint.y - y) === 1){
                //         weight = 2
                //     }
                //     else weight = 1
                // }
                probMap[y][x] += weight
            }
        }

    }

    addPrevPath(){
        this.prev.push({
            x : this.x,
            y : this.y
        })
    }

}