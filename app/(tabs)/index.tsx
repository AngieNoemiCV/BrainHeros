import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/database/supabaseAdmin'; // Importar el cliente de Supabase
import { useFocusEffect } from 'expo-router';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);


export default function LoginScreen() {
    const navigation = useNavigation();
    const [usuario, setUsuario] = useState<any>(null); // Estado para almacenar información del usuario
    const [usuariosList, setUsuariosList] = useState([]);


    const [topCorrect, setTopCorrect] = useState([]);
    const [topMistakes, setTopMistakes] = useState([]);

    const [totalDesafios, setTotalDesafios] = useState<number | null>(null);
    const [desafiosPorNivel, setDesafiosPorNivel] = useState<{ level: number; total: number }[]>([]);

    const [totalUsuarios, setTotalUsuarios] = useState<number | null>(null);


    // Obtener los detalles del usuario logueado y su progreso
    useFocusEffect(
        useCallback(() => {
            // fetchUsuario(); CAMBIO
            // checkSession(); CAMBIO
            fetchTopQuestions();
            fetchTotalDesafios();
            fetchDesafiosPorNivel();
            fetchTotalUsuarios();
        }, []),
    );

    const checkSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession(); // Método correcto para obtener la sesión
            if (!session) {
                navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
            }
        } catch {
            const { error } = await supabase.auth.signOut();
            if (!error) {
                navigation.navigate('index'); // Redirigir al login al cerrar sesión
            }
            navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
            return;
        }
    };

    const fetchUsuario = async () => {
        // Paso 1: Obtener la sesión del usuario logueado de forma asincrónica
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            console.error('Error al obtener la sesión:', sessionError.message);
            return;
        }
        const user = session?.session?.user;
        if (user) {
            // Paso 2: Consultar la tabla Usuario para obtener el nombre
            const { data: userData, error: userError } = await supabase
                .from('usuario')
                .select('name, is_admin')
                .eq('email', user.email)
                .single(); // Usamos single ya que solo esperamos un único resultado
            if (userError) {
                console.error('Error al obtener el nombre del usuario:', userError.message);
                return;
            }
            setUsuario({ email: user.email, name: userData?.name, is_admin: userData?.is_admin });
            // console.log(session)

            if (usuario?.is_admin) {
                // console.log('hi')
                return
            }
            else {
                console.log('usuario no admin')
                // navigation.navigate('Panel'); // Navegar a la pantalla de inicio de sesión
            }
        }

    };

    const fetchTopQuestions = async () => {
        try {
            // Obtener el máximo de aciertos
            const { data: maxAciertos, error: maxAciertosError } = await supabase
                .rpc('max', { column_name: 'aciertos' });

            if (maxAciertosError) {
                console.error('Error al obtener el máximo de aciertos:', maxAciertosError);
                return;
            }

            const { data: maxEquivocaciones, error: maxEquivocacionesError } = await supabase
                .rpc('max', { column_name: 'equivocaciones' });

            if (maxEquivocacionesError) {
                console.error('Error al obtener el máximo de equivocaciones:', maxEquivocacionesError);
                return;
            }

            /////////////////////////////////
            // console.log(maxAciertos) 
            // console.log(maxEquivocaciones)
            /////////////////////////////////

            // Obtener preguntas con el mayor número de aciertos
            const { data: maxAciertosData, error: maxAciertosDataError } = await supabase
                .from('QuestionsTable')
                .select('id_question, question, aciertos')
                .eq('aciertos', maxAciertos);
            // .eq('aciertos', supabase.rpc('max', { column: 'aciertos' }));

            if (maxAciertosDataError) {
                console.error('Error al obtener preguntas con más aciertos:', maxAciertosDataError);
                return;
            }

            // Obtener preguntas con el mayor número de equivocaciones
            const { data: maxEquivocacionesData, error: maxEquivocacionesDataError } = await supabase
                .from('QuestionsTable')
                .select('id_question, question, equivocaciones')
                .eq('equivocaciones', maxEquivocaciones);
            // .eq('equivocaciones', supabase.rpc('max', { column: 'equivocaciones' }));

            if (maxEquivocacionesDataError) {
                console.error('Error al obtener preguntas con más equivocaciones:', maxEquivocacionesDataError);
                return;
            }

            setTopCorrect(maxAciertosData)
            setTopMistakes(maxEquivocacionesData)

            /////////////////////////////////
            // console.log(topCorrect)
            // console.log(topMistakes)
            /////////////////////////////////

        } catch (error) {
            console.error('Error al obtener las preguntas:', error);
            return;
        }
    };

    // Fetch total desafíos
    const fetchTotalDesafios = async () => {
        try {
            const { data, error, count } = await supabase
                .from('QuestionsTable')
                .select('*', { count: 'exact' });

            if (error) {
                console.error('Error al obtener el total de desafíos:', error.message);
                return;
            }

            setTotalDesafios(count || 0); // Establecemos el total usando el conteo
        } catch (error) {
            console.error('Error inesperado al obtener el total de desafíos:', error);
        }
    };

    // Fetch desafíos por nivel
    const fetchDesafiosPorNivel = async () => {
        try {
            const { data, error } = await supabase
                .from('QuestionsTable')
                .select('id_question, level'); // Obtenemos los niveles y sus IDs

            if (error) {
                console.error('Error al obtener los desafíos por nivel:', error.message);
                return;
            }

            if (data) {
                // Agrupamos los desafíos por nivel
                const grouped = data.reduce((acc: { [key: number]: number }, item) => {
                    const level = item.level;
                    acc[level] = (acc[level] || 0) + 1;
                    return acc;
                }, {});

                // Convertimos el objeto agrupado en un array para facilitar el renderizado
                const groupedArray = Object.entries(grouped).map(([level, total]) => ({
                    level: parseInt(level, 10),
                    total,
                }));

                setDesafiosPorNivel(groupedArray);
            }
        } catch (error) {
            console.error('Error inesperado al obtener los desafíos por nivel:', error);
        }
    };


    const fetchTotalUsuarios = async () => {
        try {
            const { data, error, count } = await supabase
                .from('usuario')
                .select('*', { count: 'exact' });

            if (error) {
                console.error('Error al obtener el total de usuarios:', error.message);
                return;
            }

            setTotalUsuarios(count || 0); // Establecemos el total usando el conteo
        } catch (error) {
            console.error('Error inesperado al obtener el total de usuarios:', error);
        }
    };


    const dataPie = {
      labels: desafiosPorNivel.map((d) => `Nivel ${d.level}`),
      datasets: [
        {
          data: desafiosPorNivel.map((d) => d.total), // Extrae los totales
          backgroundColor: ['blue', 'green', 'red'],
        },
      ],
    };
    
    const opciones = {
      responsive: true,
      plugins: {
          legend: {
              display: true, // Muestra la leyenda
              position: 'top', // Posición de la leyenda (puede ser 'top', 'left', 'right', 'bottom')
              labels: {
                  font: {
                      size: 16, // Tamaño de la fuente
                      weight: 'bold', // Grosor de la fuente
                  },
                  color: '#34495e', // Color del texto
                  padding: 20, // Espaciado entre los labels
                  boxWidth: 20, // Ancho de los cuadros de color
                  boxHeight: 15, // Altura de los cuadros de color
              },
          },
      },
  };



    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>

                {/* <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Administrador')}
                // handleSaveUsername
                >
                    <Text style={styles.buttonText}>Regresar</Text>
                </TouchableOpacity> */}
                <Text style={styles.headerMain}>Indicadores</Text>

                  <Image
                    source={require('@/assets/images/brainHerosLogo.png')}
                    style={styles.imagenStyle}
                  />

                <Text style={styles.header}>Preguntas con más aciertos</Text>

                {topCorrect.map((question, index) => (
                    <View key={index} style={styles.card}>
                        <Text style={styles.question}>
                            {question.question} (Aciertos: {question.aciertos})
                        </Text>
                    </View>
                ))}

                <Text style={styles.header}>Preguntas con más equivocaciones</Text>
                {topMistakes.map((question, index) => (
                    <View key={index} style={styles.card}>
                        <Text style={styles.question}>
                            {question.question} (Equivocaciones: {question.equivocaciones})
                        </Text>
                    </View>
                ))}

                <Text style={styles.title}>Reporte de Usuarios</Text>

                <Text style={styles.text}>
                    Total de usuarios: {totalUsuarios !== null ? totalUsuarios : 'Cargando...'}
                </Text>

                {/* asdf */}
                <Text style={styles.title}>Reporte de Desafíos</Text>

                <Text style={styles.text}>
                    Total de desafíos: {totalDesafios !== null ? totalDesafios : 'Cargando...'}
                </Text>
                {/* asdf */}


                {/* <Text style={styles.subtitle}>Desafíos por Nivel:</Text>
                {desafiosPorNivel.length > 0 ? (
                    desafiosPorNivel.map(({ level, total }) => (
                        <Text key={level} style={styles.text}>
                            Nivel {level}: {total} desafíos
                        </Text>
                    ))
                ) : (
                    <Text style={styles.text}>Cargando...</Text>
                )} */}
                <Text style={styles.title}>Desafios por nivel</Text>


                <div style={styles.containerPie}>
                  <Pie data={dataPie} options={opciones} />
                </div>


                {/* asdf */}

            </View>
        </ScrollView>

    );
}

const styles = StyleSheet.create({
  containerPie: {
      width: 350,
      height: 350,
      marginVertical: 20,
      padding: 10,
      backgroundColor: '#ffe8e8',
      borderRadius: 20,
      borderWidth: 5,
      borderColor: '#ff6f61',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
  },
  container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: '#fef6e4',
      padding: 20,
  },
  scrollContainer: {
      flexGrow: 1,
      justifyContent: 'flex-start',
      backgroundColor: '#fef6e4',
  },
  headerMain: {
    fontSize: 40,
    fontWeight: '700',
    color: '#black',
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
},
  header: {
      fontSize: 28,
      fontWeight: '700',
      color: '#ff6f61',
      marginBottom: 20,
      textAlign: 'center',
      textTransform: 'uppercase',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
  },
  card: {
      padding: 20,
      marginBottom: 15,
      backgroundColor: '#ffeedb',
      borderRadius: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
      width: 400,
      borderWidth: 2,
      borderColor: '#ffd700',
      transform: [{ scale: 1 }],
      transition: 'transform 0.3s ease-in-out',
  },
  cardActive: {
      transform: [{ scale: 1.05 }],
  },
  question: {
      fontSize: 18,
      color: '#34495e',
      fontWeight: '600',
      lineHeight: 24,
      textAlign: 'center',
  },
  title: {
      fontSize: 30,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#ff6f61',
      textAlign: 'center',
      textTransform: 'capitalize',
      borderBottomWidth: 3,
      borderBottomColor: '#ff6f61',
      paddingBottom: 10,
  },
  text: {
      fontSize: 16,
      fontWeight: 'bold',
      marginVertical: 5,
      color: '#34495e',
      textAlign: 'center',
  },
  button: {
      paddingVertical: 15,
      paddingHorizontal: 25,
      backgroundColor: 'linear-gradient(to right, #ff6f61, #f9a825)',
      borderRadius: 30,
      marginVertical: 15,
      width: '90%',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 4,
  },
  buttonText: {
      fontSize: 18,
      color: '#ffffff',
      fontWeight: '600',
      textTransform: 'uppercase',
  },
  imagenStyle: {
    width: 300,
    height: 300,
    backgroundColor: '#27613C',
    marginBottom: 20,
    alignSelf: "center"
  },
});






// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
// import { supabase } from '@/database/supabase'; // Importar el cliente de Supabase
// import { useNavigation } from '@react-navigation/native'; // Importar el hook de navegación
// import { useFocusEffect } from 'expo-router';

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [name, setName] = useState(''); // Para el registro
//   const [isRegistering, setIsRegistering] = useState(false); // Estado para cambiar entre login y registro

//   useFocusEffect(
//     useCallback(() => {
//       checkSession(); // Verificar si hay una sesión abierta
//       setPassword(''),
//         setName(''),
//         setEmail('')
//     }, []),
//   );

//   const checkSession = async () => {
//     try {
//       const { data: { session } } = await supabase.auth.getSession(); // Método correcto para obtener la sesión
//       if (session) {
//         navigation.navigate('Panel'); // Navegar a la pantalla de inicio de sesión
//       } else {
//         //console.log("Usuario logueado");
//         //console.log("Usuario logueado", session);
//       }
//     } catch {
//       // navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
//       return
//     }
//   };

//   // Función para manejar el registro de un nuevo usuario
//   const handleRegister = async () => {
//     const { user, error } = await supabase.auth.signUp(
//       { email, password },
//     );

//     const is_admin = false
//     const emailower = email.toLowerCase()

//     if (error) {
//       Alert.alert('Error en el registro', error.message);
//     } else {
//       console.log("vamos a registrar Usuario")
//       // Insertar en la tabla Usuario
      

//       const { data, error: insertError } = await supabase
//         .from('usuario')
//         .insert([{ email: emailower, name, is_admin }]);

//         console.log(emailower)
//       if (insertError) {
//         Alert.alert('Error al insertar usuario', insertError.message);
//       } else {
//         //Alert.alert('Registro exitoso');
//         fillProgressTable(emailower); // Llamamos a la función para llenar ProgressTable
//       }
//       console.log("Registro exitoso")
//       Alert.alert('Registro exitoso');
//       handleLogin();
//     }
//   };

//   // Función para manejar el inicio de sesión
//   const handleLogin = async () => {
//     const { user, error } = await supabase.auth.signInWithPassword({ email, password });

//     if (error) {
//       Alert.alert('Error en el inicio de sesión', error.message);
//     } else {
//       Alert.alert('Inicio de sesión exitoso');
//       navigation.navigate('Panel'); // Redirigir a la pantalla de niveles después del login
//     }
//   };

//   // Funcion para llenar la ProgressTable
//   const fillProgressTable = async (email) => {
//     try {
//       // Paso 1: Obtener todos los niveles de QuestionsTable
//       const { data: questions, error: questionsError } = await supabase
//         .from('QuestionsTable')
//         .select('level');

//       if (questionsError) {
//         console.error('Error al obtener los niveles:', questionsError.message);
//         return;
//       }

//       // Paso 2: Crear un Set para obtener niveles únicos
//       const uniqueLevels = Array.from(new Set(questions.map(q => q.level)));

//       // Paso 3: Crear un array con los datos a insertar en ProgressTable
//       const progressEntries = uniqueLevels.map((level) => ({
//         email, // El correo del usuario como referencia
//         level_number: level, // El nivel obtenido de QuestionsTable
//         completed: false, // Inicialmente los niveles no están completados
//       }));

//       // Paso 4: Insertar los datos en ProgressTable
//       const { error: insertError } = await supabase
//         .from('ProgressTable')
//         .insert(progressEntries);

//       if (insertError) {
//         console.error('Error al llenar ProgressTable:', insertError.message);
//       } else {
//         console.log('ProgressTable llenada con éxito');
//       }
//     } catch (error) {
//       console.error('Error inesperado:', error.message);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}</Text>

//       <Image
//         source={require('@/assets/images/brainHerosLogo.png')}
//         style={styles.imagenStyle}
//       />

//       {isRegistering && (
//         <TextInput
//           style={styles.input}
//           placeholder="Nombre"
//           value={name}
//           onChangeText={setName}
//         />
//       )}

//       <TextInput
//         style={styles.input}
//         placeholder="Correo Electrónico"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Contraseña"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />

//       <Button
//         title={isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
//         onPress={isRegistering ? handleRegister : handleLogin}
//       />

//       <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
//         <Text style={styles.switchText}>
//           {isRegistering ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
//         </Text>
//       </TouchableOpacity>
//     </View>

//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     justifyContent: 'center',
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 15,
//   },
//   switchText: {
//     marginTop: 20,
//     textAlign: 'center',
//     color: '#27613C',
//   },
  // imagenStyle: {
  //   width: 120,
  //   height: 120,
  //   backgroundColor: '#27613C',
  //   marginBottom: 20,
  //   alignSelf: "center"

  // },
// });
