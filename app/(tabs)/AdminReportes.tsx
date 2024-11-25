import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/database/supabase'; // Importar el cliente de Supabase
import { useFocusEffect } from 'expo-router';

export default function AdminDashboard() {
    const navigation = useNavigation();
    const [usuario, setUsuario] = useState<any>(null); // Estado para almacenar información del usuario

    const [topCorrect, setTopCorrect] = useState([]);
    const [topMistakes, setTopMistakes] = useState([]);

    const [totalDesafios, setTotalDesafios] = useState<number | null>(null);
    const [desafiosPorNivel, setDesafiosPorNivel] = useState<{ level: number; total: number }[]>([]);


    // Obtener los detalles del usuario logueado y su progreso
    useFocusEffect(
        useCallback(() => {
            fetchUsuario();
            checkSession();
            fetchTopQuestions();
            fetchTotalDesafios();
            fetchDesafiosPorNivel();
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
                navigation.navigate('Panel'); // Navegar a la pantalla de inicio de sesión
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


    // const fetchUsersByMonth = async () => {
    //     const { data, error } = await supabase
    //         .from('usuario')
    //         .select('*')
    //         .gte('created_at', new Date(new Date().setDate(1)).toISOString())
    //         .lte('created_at', new Date().toISOString());

    //     if (error) {
    //         console.error('Error fetching users by month:', error);
    //         return 0; 
    //     }

    //     return data.length;
    // };



    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
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

                {/* asdf */}
                <Text style={styles.title}>Reporte de Desafíos</Text>

                <Text style={styles.text}>
                    Total de desafíos: {totalDesafios !== null ? totalDesafios : 'Cargando...'}
                </Text>
                {/* asdf */}


                <Text style={styles.subtitle}>Desafíos por Nivel:</Text>
                {desafiosPorNivel.length > 0 ? (
                    desafiosPorNivel.map(({ level, total }) => (
                        <Text key={level} style={styles.text}>
                            Nivel {level}: {total} desafíos
                        </Text>
                    ))
                ) : (
                    <Text style={styles.text}>Cargando...</Text>
                )}
                <Text style={styles.subtitle}></Text>


                {/* asdf */}

            </View>
        </ScrollView>

    );
}

const styles = StyleSheet.create({
    container: {
        top: 40,
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        bottom: 80,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    card: {
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 2,
    },
    question: {
        fontSize: 16,
        color: '#555',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    text: {
        fontSize: 16,
        marginVertical: 5,
    },
});