import { Random_AI } from "./Easy_Agent.js"
import { gridnum } from "./util_functions.js"

export class Hunt_and_Target_AI extends Random_AI{

    constructor(){

        super()

        this.priortized_targets = []
        this.prev = []
        this.mode = "HUNT"
    }

    choose_target(board){

        //targeting algorithm
        if(this.mode === "TARGET"){
            
            if(this.priortized_targets.length > 0){
                this.x  = this.priortized_targets[0].x
                this.y  = this.priortized_targets[0].y
            }
            else this.mode = "HUNT"
     
        }

        if(this.mode === "HUNT"){
            while(true){

                this.x  = Math.floor(Math.random() * 8)
                this.y = Math.floor(Math.random() * 8)

                if((board[ this.y ][ this.x ] > -1)) break
            
            }
        }
        
        this.shot++
        
    }

    getFeedback(state,board){

        if(state.result === 0){ 

            if(this.mode === "TARGET"){

                //PLACE NEW TARGET FROM PRIORITIZED TARGET 
                //TO FIRE NEXT TURN

                this.priortized_targets.shift()
            }

        }
        else if(state.result > 0){

            this.addPrevPath()
            if(state.result === 1){
                //HIT    
                if(this.mode === "HUNT"){

                    //INITITATE TARGETING MODE
                    //FIND PRIORITIZED TARGETS
                    
                    this.priortized_targets = this.setPrioritizeTarget(board)

                    this.mode = "TARGET"

                }
                else if(this.mode === "TARGET"){
                    
                    //HIT
                    let x,y
                    if(this.priortized_targets[0].align === 1){
                        x = this.priortized_targets[0].x 
                        y = this.priortized_targets[0].y + (this.priortized_targets[0].step)
                    }
                    else if(this.priortized_targets[0].align === 0){
                        x = this.priortized_targets[0].x + (this.priortized_targets[0].step)
                        y = this.priortized_targets[0].y
                    }

                    if(this.checkValidDirection(x,y,board)){
                        this.priortized_targets[0].x = x
                        this.priortized_targets[0].y = y
                    }
                    else{
                        //can't go that direction, remove
                        this.priortized_targets.shift()
                    }
                    
                }

            }
            else if(state.result === 2){

                //console.log("SINK!!")
                //if(shiplen > 1)

                this.priortized_targets.shift()

                this.clearTraveledPath(state.shipData)

                this.priortized_targets = []
                if(this.prev.length === 0){
                    this.mode = "HUNT"
                }
                else if(this.prev.length > 0){
                    for(let i=0;i<this.prev.length;i++){
                        this.x = this.prev[i].x
                        this.y = this.prev[i].y

                        // console.log("new root : ")
                        // console.log(this.prev[i])
                        const temp = this.setPrioritizeTarget(board)

                        // console.log("expanding paths : ")
                        // printArray(temp)

                        for(let j=(temp.length - 1);j>=0;j--){
                            this.priortized_targets.unshift(
                                {
                                    x : temp[j].x,
                                    y : temp[j].y,
                                    step : temp[j].step,
                                    align : temp[j].align
                                }
                            )
                        }
                    }
                }

                this.player_ships_remaining.splice(this.player_ships_remaining.indexOf(state.shipData.block),1)

            }
        }
        

        this.priortized_targets = this.priortized_targets.filter(
            (e) => (board[e.y][e.x] > -1)
        )

        // if(this.mode === "TARGET"){
        //     console.log("prioritized targets")
        //     printArray(this.priortized_targets)
        // }

        if(this.priortized_targets.length === 0) this.mode = "HUNT"

        if(this.player_ships_remaining.length === 0) this.mode = "CLOSE"

    }

    setPrioritizeTarget(board){

        const temp = []

        const Align = Math.floor(Math.random() * 2)
        const UpDown = (Math.random() < 0.5)? -1:1
        const LeftRight = (Math.random() < 0.5)? -1:1

        //ALIGN 1 = VERTICAL
        if(Align === 1){

            //DIRECTION 1 = UP AND DOWN
            //DIRECTION 0 = DOWN AND UP
            temp.push(
                this.getPotentialTarget(this.x,this.y + (UpDown * 1),UpDown ,Align,board),
                this.getPotentialTarget(this.x,this.y + (UpDown * -1), -UpDown,Align,board)
            )

            //DIRECTION 1 = LEFT TO RIGHT
            //DIRECTION 0 = RIGHT TO LEFT
            temp.push(
                this.getPotentialTarget(this.x + (LeftRight * 1),this.y, LeftRight,Align - 1,board),
                this.getPotentialTarget(this.x + (LeftRight * -1),this.y, -LeftRight,Align - 1,board)
            )
            
        }
        //ALIGN 0 = HORIZONTAL
        else if(Align === 0){
            
            //DIRECTION 1 = LEFT TO RIGHT
            //DIRECTION 0 = RIGHT TO LEFT
            temp.push(
                this.getPotentialTarget(this.x + (LeftRight * 1),this.y,LeftRight, Align,board),
                this.getPotentialTarget(this.x + (LeftRight * -1),this.y,-LeftRight, Align,board)
            )

            //DIRECTION 1 = UP AND DOWN
            //DIRECTION 0 = DOWN AND UP
            temp.push(
                this.getPotentialTarget(this.x,this.y + (UpDown * 1) ,UpDown,Align + 1,board),
                this.getPotentialTarget(this.x,this.y + (UpDown * -1) ,-UpDown,Align + 1,board)
            )

        }

        //this.priortized_target = temp.filter((cood) => (cood !== undefined))
        return temp.filter((cood) => (cood !== undefined)) 
    }

    addPrevPath(){
        if(this.priortized_targets.length === 0){
            this.prev.unshift(
                {
                    x : this.x,
                    y : this.y,
                    step : 0,
                    align : -1
                }
            )
        }
        else{
            this.prev.unshift(
                {
                    x : this.priortized_targets[0].x,
                    y : this.priortized_targets[0].y,
                    step : this.priortized_targets[0].step,
                    align : this.priortized_targets[0].align
                }
            )
        }
    }
    
    getPotentialTarget = (x,y,step,align,board) => {
        if(this.checkValidDirection(x,y,board)){
            return {
                x : x,
                y : y,
                step : step,
                align : align
            }
        }
        else return undefined

    }

    checkValidDirection = (x,y,board) =>{
        return (x < gridnum) && (x >= 0) && (y < gridnum) && (y >= 0) && (board[y][x] !== -1)
    }

    checkInRange = (n1,n2,num) =>{
        if(n1 > n2){
            return ( n2 <= num ) && ( num <= n1 )
        }
        else if(n1 < n2){
            return ( n1 <= num ) && ( num <= n2 )
        }
        else if(n1 === n2) return num === n1
    }

    clearTraveledPath(shipData){
        //clear complete path
        if(shipData.align === 1){
            //clear path on vertical
            this.prev = this.prev.filter((e) => 
                !(
                    this.checkInRange(shipData.x,this.x,e.x) && 
                        this.checkInRange(shipData.y,shipData.y + (shipData.block - 1),e.y)
                )
            )

        }
        else if(shipData.align === 0){
            this.prev = this.prev.filter((e) => 
                !(
                    this.checkInRange(shipData.x,shipData.x + (shipData.block - 1),e.x) && 
                    this.checkInRange(shipData.y,this.y,e.y)
                )
            )
        }
    }

}