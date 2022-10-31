import {Application, Context, Router} from "https://deno.land/x/oak@v11.1.0/mod.ts"
const app= new Application();
const router = new Router();
//id que se asignara al siguiente usuario, al crear usuario se le suma 1 asegurando que nunca sera el mismo valor
let contadorId:number;
contadorId=1;

type User={
DNI:string,
name:string,
surname:string,
telephone:number,
email:string,
IBAN:string,
id:number
}

type Transaction={
id_Sender:number,
id_Reciber:number,
amount:number
}
let users:User[]=[];
let transactions:Transaction[]=[];

const userDataCheck: (value:any,ctx:Context) => boolean = (value:any,ctx:Context):boolean => {
   if(!value.email||!value.name||!value.surname||!value.telephone||!value.DNI){
      ctx.response.body="faltan parametros para crear un usuario";
      ctx.response.status=400;
      return;
   }
   const DNI:string = String(value.DNI)
   if(users.find((user) => (user.DNI===DNI)||users.find((user) => (user.email===String(value.email))))){
      ctx.response.body="el usuario ya existe";
      ctx.response.status=400;
      return;
   }
   if(!DNI.length===9||isNaN(DNI.charAt(0))||isNaN(DNI.charAt(1))||isNaN(DNI.charAt(2))||isNaN(DNI.charAt(3))||isNaN(DNI.charAt(4))||isNaN(DNI.charAt(5))||isNaN(DNI.charAt(6))||isNaN(DNI.charAt(7))||!isNaN(DNI.charAt(8))){
      ctx.response.body="dni incorrecto, el formato correcto para el dni es 12345678A";
      ctx.response.status=400;
      return;
   }
   if(!String(value.email).includes("@")||!String(value.email).endsWith(".com")){
      ctx.response.body="email incorrecto, el formato correcto para el email es user@servidormail.com";
      ctx.response.status=400;
      return;
   }
   if(!(String(value.telephone).length===9)||!(typeof(value.telephone)==="number")){
      ctx.response.body="telefono incorrecto, debe ser un numero de 9 digitos";
      ctx.response.status=400;
      return false;
   }
   return true;
}

const generateUser: (value:any,ctx:Context) => User  = (value:any,ctx:Context):User=> {
      //generamos iban que se compone de ES y un numero aleatorio de 22 cifras
      let newIban:string;
      do{
         newIban="ES"
         while(newIban.length<24){
            newIban=newIban+String(Math.trunc(Math.random()*9))
         }
      //comprobamos que el IBAN es unico y si no lo es generamos otro
      }while(users.find((user) => user.IBAN === newIban))
      const newUser:User={
         DNI: value.DNI,
         name: value.name,
         surname: value.surname,
         telephone: value.telephone,
         email: value.email,
         IBAN: newIban,
         id: contadorId
      }
      contadorId++
      ctx.response.status=200;
      ctx.response.body="Usuario creado con id "+newUser.id+" y con IBAN "+newUser.IBAN
      return newUser
}

const transactionDataCheck: (value:any,ctx:Context) => boolean = (value:any,ctx:Context):boolean => {
   if(!value.id_Reciber||!value.id_Sender||!value.amount){
      ctx.response.body="faltan parametros";
      ctx.response.status=400;
      return;
   }
   if(!users.find((user) => (user.id===value.id_Reciber))||!users.find((user) => (user.id===value.id_Sender))){
      ctx.response.body="los usuarios no existen";
      ctx.response.status=400;
      return;
   }
   return true;
}  
const generateTransaction: (value:any,ctx:Context) => Transaction  = (value:any,ctx:Context):Transaction=> {
   const newTransaction:Transaction={
      id_Sender: value.id_Sender,
      id_Reciber: value.id_Reciber,
      amount: value.amount
   }
   ctx.response.status=200;
   ctx.response.body="transacción creada";
   return newTransaction;
} 
router
.get("/",(context)=>{
   context.response.body="hola"  ;
})
.get("/getUser/:user", (context)=>{
   if (context.params?.user) {
      const user:User | undefined = users.find(
        (user) => user.email === context.params.user
      );
      if (user) {
         context.response.body = user;
         context.response.status = 200;
         return;
       }
     }
     context.response.body = "usuario no encontrado";
     context.response.status = 404;
})
.delete("/deleteUser/:user", (context) => {
   if (
     context.params?.user &&
     users.find((user) => user.email === context.params.user)
   ) {
     users = users.filter((user) => user.email !== context.params.user);
     context.response.body = "eliminado";
     context.response.status = 200;
     return;
   }
   context.response.body = "usuario no encontrado";
   context.response.status = 404;
})
 .post("/addTransaction", async (context) => {
   const result = context.request.body({ type: "json" });
   const value = await result.value;
   if(transactionDataCheck(value,context))transactions.push(generateTransaction(value,context));
   else context.response.status=400
})
.post("/addUser", async (context) => {
   const result = context.request.body({ type: "json" });
   const value = await result.value;
   if(userDataCheck(value,context))users.push(generateUser(value,context));
})
app.use(router.routes())
app.use(router.allowedMethods())
await app.listen({port:8000}) 







