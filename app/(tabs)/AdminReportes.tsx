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
            fetchUsuario(); 
            checkSession(); 
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


                <Text style={styles.title}>Desafios por nivel:</Text>
                {desafiosPorNivel.length > 0 ? (
                    desafiosPorNivel.map(({ level, total }) => (
                        <Text key={level} style={styles.text}>
                            Nivel {level}: {total} desafíos
                        </Text>
                    ))
                ) : (
                    <Text style={styles.text}>Cargando...</Text>
                )}
                {/* <Text style={styles.title}>Desafios por nivel</Text> */}


                {/* <div style={styles.containerPie}>
                  <Pie data={dataPie} options={opciones} />
                </div> */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Administrador')}
                // handleSaveUsername
                >
                    <Text style={styles.buttonText}>Regresar</Text>
                </TouchableOpacity>


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
      width: 300,
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




// Reportes version anterior de chart

// import React, { useCallback, useEffect, useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { supabase } from '@/database/supabaseAdmin'; // Importar el cliente de Supabase
// import { useFocusEffect } from 'expo-router';

// export default function AdminDashboard() {
//     const navigation = useNavigation();
//     const [usuario, setUsuario] = useState<any>(null); // Estado para almacenar información del usuario
//     const [usuariosList, setUsuariosList] = useState([]);


//     const [topCorrect, setTopCorrect] = useState([]);
//     const [topMistakes, setTopMistakes] = useState([]);

//     const [totalDesafios, setTotalDesafios] = useState<number | null>(null);
//     const [desafiosPorNivel, setDesafiosPorNivel] = useState<{ level: number; total: number }[]>([]);

//     const [totalUsuarios, setTotalUsuarios] = useState<number | null>(null);


//     // Obtener los detalles del usuario logueado y su progreso
//     useFocusEffect(
//         useCallback(() => {
//             // fetchUsuario(); CAMBIO
//             // checkSession(); CAMBIO
//             fetchTopQuestions();
//             fetchTotalDesafios();
//             fetchDesafiosPorNivel();
//             fetchTotalUsuarios();
//         }, []),
//     );

//     const checkSession = async () => {
//         try {
//             const { data: { session } } = await supabase.auth.getSession(); // Método correcto para obtener la sesión
//             if (!session) {
//                 navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
//             }
//         } catch {
//             const { error } = await supabase.auth.signOut();
//             if (!error) {
//                 navigation.navigate('index'); // Redirigir al login al cerrar sesión
//             }
//             navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
//             return;
//         }
//     };

//     const fetchUsuario = async () => {
//         // Paso 1: Obtener la sesión del usuario logueado de forma asincrónica
//         const { data: session, error: sessionError } = await supabase.auth.getSession();
//         if (sessionError) {
//             console.error('Error al obtener la sesión:', sessionError.message);
//             return;
//         }
//         const user = session?.session?.user;
//         if (user) {
//             // Paso 2: Consultar la tabla Usuario para obtener el nombre
//             const { data: userData, error: userError } = await supabase
//                 .from('usuario')
//                 .select('name, is_admin')
//                 .eq('email', user.email)
//                 .single(); // Usamos single ya que solo esperamos un único resultado
//             if (userError) {
//                 console.error('Error al obtener el nombre del usuario:', userError.message);
//                 return;
//             }
//             setUsuario({ email: user.email, name: userData?.name, is_admin: userData?.is_admin });
//             // console.log(session)

//             if (usuario?.is_admin) {
//                 // console.log('hi')
//                 return
//             }
//             else {
//                 console.log('usuario no admin')
//                 // navigation.navigate('Panel'); // Navegar a la pantalla de inicio de sesión
//             }
//         }

//     };

//     const fetchTopQuestions = async () => {
//         try {
//             // Obtener el máximo de aciertos
//             const { data: maxAciertos, error: maxAciertosError } = await supabase
//                 .rpc('max', { column_name: 'aciertos' });

//             if (maxAciertosError) {
//                 console.error('Error al obtener el máximo de aciertos:', maxAciertosError);
//                 return;
//             }

//             const { data: maxEquivocaciones, error: maxEquivocacionesError } = await supabase
//                 .rpc('max', { column_name: 'equivocaciones' });

//             if (maxEquivocacionesError) {
//                 console.error('Error al obtener el máximo de equivocaciones:', maxEquivocacionesError);
//                 return;
//             }

//             /////////////////////////////////
//             // console.log(maxAciertos) 
//             // console.log(maxEquivocaciones)
//             /////////////////////////////////

//             // Obtener preguntas con el mayor número de aciertos
//             const { data: maxAciertosData, error: maxAciertosDataError } = await supabase
//                 .from('QuestionsTable')
//                 .select('id_question, question, aciertos')
//                 .eq('aciertos', maxAciertos);
//             // .eq('aciertos', supabase.rpc('max', { column: 'aciertos' }));

//             if (maxAciertosDataError) {
//                 console.error('Error al obtener preguntas con más aciertos:', maxAciertosDataError);
//                 return;
//             }

//             // Obtener preguntas con el mayor número de equivocaciones
//             const { data: maxEquivocacionesData, error: maxEquivocacionesDataError } = await supabase
//                 .from('QuestionsTable')
//                 .select('id_question, question, equivocaciones')
//                 .eq('equivocaciones', maxEquivocaciones);
//             // .eq('equivocaciones', supabase.rpc('max', { column: 'equivocaciones' }));

//             if (maxEquivocacionesDataError) {
//                 console.error('Error al obtener preguntas con más equivocaciones:', maxEquivocacionesDataError);
//                 return;
//             }

//             setTopCorrect(maxAciertosData)
//             setTopMistakes(maxEquivocacionesData)

//             /////////////////////////////////
//             // console.log(topCorrect)
//             // console.log(topMistakes)
//             /////////////////////////////////

//         } catch (error) {
//             console.error('Error al obtener las preguntas:', error);
//             return;
//         }
//     };

//     // Fetch total desafíos
//     const fetchTotalDesafios = async () => {
//         try {
//             const { data, error, count } = await supabase
//                 .from('QuestionsTable')
//                 .select('*', { count: 'exact' });

//             if (error) {
//                 console.error('Error al obtener el total de desafíos:', error.message);
//                 return;
//             }

//             setTotalDesafios(count || 0); // Establecemos el total usando el conteo
//         } catch (error) {
//             console.error('Error inesperado al obtener el total de desafíos:', error);
//         }
//     };

//     // Fetch desafíos por nivel
//     const fetchDesafiosPorNivel = async () => {
//         try {
//             const { data, error } = await supabase
//                 .from('QuestionsTable')
//                 .select('id_question, level'); // Obtenemos los niveles y sus IDs

//             if (error) {
//                 console.error('Error al obtener los desafíos por nivel:', error.message);
//                 return;
//             }

//             if (data) {
//                 // Agrupamos los desafíos por nivel
//                 const grouped = data.reduce((acc: { [key: number]: number }, item) => {
//                     const level = item.level;
//                     acc[level] = (acc[level] || 0) + 1;
//                     return acc;
//                 }, {});

//                 // Convertimos el objeto agrupado en un array para facilitar el renderizado
//                 const groupedArray = Object.entries(grouped).map(([level, total]) => ({
//                     level: parseInt(level, 10),
//                     total,
//                 }));

//                 setDesafiosPorNivel(groupedArray);
//             }
//         } catch (error) {
//             console.error('Error inesperado al obtener los desafíos por nivel:', error);
//         }
//     };


//     const fetchTotalUsuarios = async () => {
//         try {
//             const { data, error, count } = await supabase
//                 .from('usuario')
//                 .select('*', { count: 'exact' });

//             if (error) {
//                 console.error('Error al obtener el total de usuarios:', error.message);
//                 return;
//             }

//             setTotalUsuarios(count || 0); // Establecemos el total usando el conteo
//         } catch (error) {
//             console.error('Error inesperado al obtener el total de usuarios:', error);
//         }
//     };



//     return (
//         <ScrollView contentContainerStyle={styles.scrollContainer}>
//             <View style={styles.container}>

//                 <TouchableOpacity
//                     style={styles.button}
//                     onPress={() => navigation.navigate('Administrador')}
//                 // handleSaveUsername
//                 >
//                     <Text style={styles.buttonText}>Regresar</Text>
//                 </TouchableOpacity>

//                 <Text style={styles.header}>Preguntas con más aciertos</Text>

//                 {topCorrect.map((question, index) => (
//                     <View key={index} style={styles.card}>
//                         <Text style={styles.question}>
//                             {question.question} (Aciertos: {question.aciertos})
//                         </Text>
//                     </View>
//                 ))}

//                 <Text style={styles.header}>Preguntas con más equivocaciones</Text>
//                 {topMistakes.map((question, index) => (
//                     <View key={index} style={styles.card}>
//                         <Text style={styles.question}>
//                             {question.question} (Equivocaciones: {question.equivocaciones})
//                         </Text>
//                     </View>
//                 ))}

//                 <Text style={styles.title}>Reporte de Usuarios</Text>

//                 <Text style={styles.text}>
//                     Total de usuarios: {totalUsuarios !== null ? totalUsuarios : 'Cargando...'}
//                 </Text>

//                 {/* asdf */}
//                 <Text style={styles.title}>Reporte de Desafíos</Text>

//                 <Text style={styles.text}>
//                     Total de desafíos: {totalDesafios !== null ? totalDesafios : 'Cargando...'}
//                 </Text>
//                 {/* asdf */}


//                 <Text style={styles.subtitle}>Desafíos por Nivel:</Text>
//                 {desafiosPorNivel.length > 0 ? (
//                     desafiosPorNivel.map(({ level, total }) => (
//                         <Text key={level} style={styles.text}>
//                             Nivel {level}: {total} desafíos
//                         </Text>
//                     ))
//                 ) : (
//                     <Text style={styles.text}>Cargando...</Text>
//                 )}
//                 <Text style={styles.subtitle}></Text>


//                 {/* asdf */}

//             </View>
//         </ScrollView>

//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         top: 40,
//         flex: 1,
//         alignItems: 'center',
//         backgroundColor: '#f2f4f7',
//         padding: 20,
//         bottom: 80,
//     },
//     scrollContainer: {
//         flexGrow: 1,
//         justifyContent: 'flex-start',
//         backgroundColor: '#f2f4f7',
//     },
//     header: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: '#34495e',
//         marginBottom: 20,
//         textAlign: 'center',
//     },
//     card: {
//         padding: 20,
//         marginBottom: 15,
//         backgroundColor: '#ffffff',
//         borderRadius: 10,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 3 },
//         shadowOpacity: 0.1,
//         shadowRadius: 6,
//         elevation: 3,
//         width: '90%',
//         alignItems: "center",
//     },
//     question: {
//         fontSize: 18,
//         color: '#2c3e50',
//         fontWeight: '500',
//     },
//     title: {
//         fontSize: 26,
//         fontWeight: 'bold',
//         marginBottom: 15,
//         color: '#2c3e50',
//         textAlign: 'center',
//     },
//     subtitle: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         marginTop: 25,
//         marginBottom: 10,
//         color: '#7f8c8d',
//     },
//     text: {
//         fontSize: 16,
//         marginVertical: 5,
//         marginBottom: 20,
//         color: '#34495e',
//     },
//     button: {
//         paddingVertical: 12,
//         paddingHorizontal: 20,
//         backgroundColor: '#1abc9c',
//         borderRadius: 8,
//         marginRight: 10,
//         width: '45%',
//         marginBottom: 20,
//         alignItems: 'center',
//         justifyContent: 'center',
//         flexDirection: 'row',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 5,
//         elevation: 3,
//     },
//     buttonText: {
//         fontSize: 18,
//         color: '#ffffff',
//         fontWeight: 'bold',
//     },
// });
