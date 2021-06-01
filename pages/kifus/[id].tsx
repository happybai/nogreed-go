import {useState, useEffect, useCallback} from 'react';
import {Card, Image, Table} from 'semantic-ui-react';
import {GetServerSideProps} from 'next';
import GBan, {move as moveStone} from 'gboard';
import styled from 'styled-components';

import {selectUI, kifuRequest} from 'slices';
import {NumberParam, useQueryParam, withDefault} from 'use-query-params';
import {KifuControls, ShareBar} from 'components/common';
import {useDispatch, useTypedSelector} from 'utils';
import {zeros, matrix, Matrix} from 'mathjs';
import {sgfToPosition} from 'common/Helper';
import {createViewedKifus} from 'slices/viewedSlice';

const KifuBoard = styled.div``;
let board: any;

let mats: Map<number, Matrix> = new Map();
const Kifu = ({kifu}: {kifu: any}) => {
  const dispatch = useDispatch();
  const {token} = useTypedSelector(i => i.auth);
  const {theme, coordinates} = useTypedSelector(state => selectUI(state));
  const [mat, setMat] = useState<Matrix>(matrix(zeros([19, 19])));
  const [marks, setMarks] = useState<Matrix>(matrix(zeros([19, 19])));
  const [move, setMove] = useQueryParam('move', withDefault(NumberParam, 0));

  const boardRef = useCallback(node => {
    if (node !== null) {
      mats.set(0, matrix(zeros([19, 19])));
      board = new GBan();
      board.init(node);
    }
  }, []);

  const {
    moves_count,
    b_name_en,
    w_name_en,
    b_rank,
    w_rank,
    valid_date,
    komi,
    result,
  } = kifu.data.attributes;

  const handleNext = () => {
    if (move < moves_count) {
      setMove(move + 1);
    }
  };

  const handlePrev = () => {
    if (move > 1) {
      setMove(move - 1);
    }
  };

  const handleFastPrev = () => {
    move > 10 ? setMove(move - 10) : setMove(1);
  };

  const handleFastNext = () => {
    move < moves_count - 10 ? setMove(move + 10) : setMove(moves_count);
  };

  const handleFirst = () => {
    setMove(1);
  };

  const handleLast = () => {
    setMove(moves_count);
  };

  useEffect(() => {
    dispatch(createViewedKifus({data: {record: {kifu_id: kifu.data.id}}}));
    mats = new Map();
  }, [dispatch, token]);

  useEffect(() => {
    const keyDownEvent = (event: KeyboardEvent) => {
      const keyName = event.key;
      if (keyName === 'Shift' || keyName === 'Alt') return;
      if (event.shiftKey) {
        if (keyName === 'ArrowLeft') handleFastPrev();
        if (keyName === 'ArrowRight') handleFastNext();
      } else if (event.altKey) {
        if (keyName === 'ArrowLeft') handleFirst();
        if (keyName === 'ArrowRight') handleLast();
      } else {
        if (keyName === 'ArrowLeft') handlePrev();
        if (
          keyName === 'ArrowRight' ||
          keyName === ' ' ||
          keyName === 'Enter'
        ) {
          handleNext();
        }
      }
    };
    document.addEventListener('keydown', keyDownEvent, false);
    return () => {
      document.removeEventListener('keydown', keyDownEvent, false);
    };
  });

  useEffect(() => {
    const padding = coordinates ? 30 : 10;
    board.setOptions({coordinates, padding});
    board.setTheme(theme, mat, marks);
    board.render(mat, marks);
  }, [mat, theme, coordinates, marks]);

  useEffect(() => {
    if (kifu && move > 0) {
      const {steps, moves_count} = kifu.data.attributes;
      if (move > moves_count) return;
      const index = move - 1;
      const {x, y, ki} = sgfToPosition(steps.split(';')[index]);
      let mat = mats.get(move);
      if (mat) {
        const newMat = moveStone(mat, x, y, ki);
        setMat(newMat);
        mats.set(move, newMat);
        mat = mats.get(index);
      } else {
        mat = matrix(zeros([19, 19]));
        let newMat = matrix(zeros([19, 19]));
        for (let i = 0; i < move; i++) {
          const {x, y, ki} = sgfToPosition(steps.split(';')[i]);
          newMat = moveStone(mat, x, y, ki);
          mats.set(i + 1, newMat);
          mat = newMat;
        }
        setMat(newMat);
      }
      const marks = matrix(zeros([19, 19]));
      marks.set([x, y], ki);
      setMarks(marks);
    }
  }, [move, kifu]);

  return (
    <div className="flex flex-col lg:flex-row">
      <KifuBoard
        className="board"
        id="kifu-board"
        ref={boardRef}
        onClick={handleNext}
      />
      <div className="flex -ml-2 lg:hidden mb-3 justify-center">
        <KifuControls
          onFirst={handleFirst}
          onFastPrev={handleFastPrev}
          onPrev={handlePrev}
          onNext={handleNext}
          onFastNext={handleFastNext}
          onLast={handleLast}
        />
      </div>
      <div className="flex-1 px-8">
        <div>
          <div className="my-2">
            <Card>
              <Card.Content>
                <Image
                  floated="left"
                  style={{marginBottom: 0, marginRight: 10}}
                >
                  <span className="inline-block rounded-full h-10 w-10 bg-black mr-0.5" />
                </Image>
                <Card.Header>{b_name_en}</Card.Header>
                <Card.Meta>{b_rank}</Card.Meta>
              </Card.Content>
            </Card>
          </div>
          <div className="my-2">
            <Card>
              <Card.Content>
                <Image
                  floated="left"
                  style={{marginBottom: 0, marginRight: 10}}
                >
                  <span className="inline-block rounded-full h-10 w-10 bg-white border border-black mr-0.5" />
                </Image>
                <Card.Header>{w_name_en}</Card.Header>
                <Card.Meta>{w_rank}</Card.Meta>
              </Card.Content>
            </Card>
          </div>
        </div>
        <div className="mt-5">
          <ShareBar shareUrl={''} shareTitle={''} shareImage={''} />
        </div>
        <Table style={{width: 290}} size="small">
          <Table.Body>
            <Table.Row>
              <Table.Cell singleLine>Date: </Table.Cell>
              <Table.Cell>{valid_date}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell singleLine>Komi: </Table.Cell>
              <Table.Cell>{komi}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell singleLine>Result: </Table.Cell>
              <Table.Cell>{result}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        <Table style={{width: 290}}>
          <Table.Row>
            <Table.Cell>
              <KifuControls
                onFirst={handleFirst}
                onFastPrev={handleFastPrev}
                onPrev={handlePrev}
                onNext={handleNext}
                onFastNext={handleFastNext}
                onLast={handleLast}
              />
            </Table.Cell>
          </Table.Row>
        </Table>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async context => {
  const res = await kifuRequest({
    pattern: {id: context.query.id.toString()},
  });
  return {props: {kifu: res.data}};
};

export default Kifu;
